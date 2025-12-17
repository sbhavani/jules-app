from playwright.sync_api import sync_playwright

def verify_session_keeper():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport size since the layout description mentioned mobile-friendly
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:3000")

            # Since we don't have an API key, we won't see the full UI or the Session Keeper button by default
            # But the Session Keeper code checks for API key.
            # We can try to set a fake API key in localStorage to trigger the button visibility.

            page.evaluate("localStorage.setItem('jules-api-key', 'fake-api-key')")
            page.reload()

            # Wait for the button to appear (it has a gear icon or spinner)
            # The button has title="Session Keeper Settings"
            settings_btn = page.locator('button[title="Session Keeper Settings"]')
            settings_btn.wait_for(state="visible", timeout=5000)

            # Click the button to open the modal
            settings_btn.click()

            # Wait for modal content
            page.wait_for_selector("text=Session Keeper (Auto-Pilot)")

            # Take a screenshot of the modal
            page.screenshot(path="verification/session_keeper_modal.png")
            print("Screenshot taken: verification/session_keeper_modal.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_session_keeper()
