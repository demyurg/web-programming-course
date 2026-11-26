type ModuleHeaderProps = {
  title: string;
  count: number;
};

export function ModuleHeader({ title, count }: ModuleHeaderProps) {
  return (
    <header style={{ marginBottom: "20px" }}>
      <h1>{title}</h1>
      <p>Всего заданий: {count}</p>
    </header>
  );
}