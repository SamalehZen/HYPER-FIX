import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Liste pour stocker les erreurs de la console
        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"CONSOLE {msg.type.upper()}: {msg.text}"))

        try:
            # Naviguer vers la page de correction avec le bon URL
            print("Navigating to http://localhost:5173/service/correction-libelle ...")
            await page.goto("http://localhost:5173/service/correction-libelle", wait_until="networkidle")

            # Attendre un peu pour s'assurer que tout est chargé
            await page.wait_for_timeout(2000)

            print("Taking screenshot...")
            await page.screenshot(path="jules-scratch/verification/correction_page.png")
            print("Screenshot saved to jules-scratch/verification/correction_page.png")

        except Exception as e:
            print(f"An error occurred: {e}")

        finally:
            await browser.close()

            if console_errors:
                print("\n--- Console Errors Captured ---")
                for error in console_errors:
                    print(error)
            else:
                print("\n--- No console errors were captured. ---")


if __name__ == "__main__":
    asyncio.run(main())
