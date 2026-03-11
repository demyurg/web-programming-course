import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../app'

describe('Sessions Feature', () => {
    let studentToken: string
    let adminToken: string

    beforeEach(async () => {
        // Получаем токены перед каждым тестом
        const studentRes = await app.request('/api/auth/github/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: 'test_student' })
        })
        const studentData = await studentRes.json()
        studentToken = studentData.token

        const adminRes = await app.request('/api/auth/github/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: 'test_teacher' })
        })
        const adminData = await adminRes.json()
        adminToken = adminData.token
    })

    it('GET /api/questions - без токена возвращает 401', async () => {
        const res = await app.request('/api/questions')
        expect(res.status).toBe(401)
    })

    it('GET /api/questions - с токеном возвращает 200', async () => {
        const res = await app.request('/api/questions', {
            headers: { Authorization: `Bearer ${studentToken}` }
        })
        expect(res.status).toBe(200)
    })
})