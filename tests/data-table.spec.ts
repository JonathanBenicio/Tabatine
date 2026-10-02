import { test, expect } from "./fixtures/test";

test.describe("DataTable reutilizável", () => {
  test("permite ordenar por teclado e informa o sentido da ordenação", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.goto("/clientes");
    const header = page.getByRole("columnheader", { name: /empresa/i });
    const button = header.getByRole("button");
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await button.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await button.press("Space");
    await expect(header).toHaveAttribute("aria-sort", "none");
    await button.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "ascending");
  });

  test("mantém fixação com fundo válido nos temas claro e escuro", async ({
    page,
  }) => {
    await page.goto("/vendas");
    const header = page.getByRole("columnheader", { name: /data/i }).first();
    const pinned = page.locator("tbody td").first();
    for (const dark of [false, true]) {
      await page.evaluate((enabled: boolean): void => {
        document.documentElement.classList.toggle("dark", enabled);
      }, dark);
      const styles = await pinned.evaluate(
        (element): { position: string; color: string } => {
          const style = getComputedStyle(element);
          return { position: style.position, color: style.backgroundColor };
        },
      );
      await expect(header).toBeVisible();
      expect(styles.position).toBe("sticky");
      expect(styles.color).not.toBe("rgba(0, 0, 0, 0)");
    }
  });
});
