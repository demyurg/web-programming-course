import { Hono } from "hono";
import { sign } from "hono/jwt";
import { PrismaClient } from "@prisma/client";
import {githubCodeSchema} from "../utils/validation.js"
import type { Context } from "hono";
import { verify } from "hono/jwt";

const prisma = new PrismaClient();
const auth = new Hono();

//GET /api/auth/me, защищенный jwt
auth.get("/api/auth/me", async (c: Context) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    // Проверка JWT
    let payload;
    try {
      payload = await verify(token, process.env.JWT_SECRET as string, "HS256");
    } catch (err) {
      return c.json({ message: "Invalid token" }, 401);
    }

    const userId = payload.sub;

    if (!userId || typeof userId !== "string") {
        return c.json({ message: "Invalid token" }, 401);
    }

    // Поиск пользователя в БД
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        githubId: true
      }
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    return c.json({ user });
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

auth.post("/api/auth/github/callback", async (c) => {
  const body = await c.req.json();

  // validation
  const { code } = githubCodeSchema.parse(body);

  let githubUser;

  //mock mode
  if (code.startsWith("test_")) {
    githubUser = {
      id: "123456",
      email: "test@example.com",
      name: "Test User",
    };
  }

  //real mode
  else {
    // обмен code → access_token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    const accessToken = tokenData.access_token;

    //получение данных пользователя
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const userData = await userResponse.json();

    githubUser = {
      id: String(userData.id),
      email: userData.email || "",
      name: userData.name || userData.login,
    };
  }

  //db 
  const user = await prisma.user.upsert({
    where: { githubId: githubUser.id },
    update: {
      email: githubUser.email,
      name: githubUser.name,
    },
    create: {
      githubId: githubUser.id,
      email: githubUser.email,
      name: githubUser.name,
    },
  });

  //jwt токен
  const token = await sign(
    {
      sub: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET as string
  );

  return c.json({
    token,
    user,
  });
});

export default auth;