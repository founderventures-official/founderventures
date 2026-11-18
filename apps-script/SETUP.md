# Connecting the application form (Google Sheets + Drive)

About 10 minutes. You need a Google account that will own the applications.

## 1. Create the Sheet and paste the script
1. Go to sheets.google.com and create a blank spreadsheet. Name it **Founder Ventures — Applications**.
2. In the Sheet: **Extensions → Apps Script**.
3. Delete the sample code, paste in everything from `Code.gs`, and click **Save**.
4. `NOTIFY_EMAIL` is already set to founderventures.official@gmail.com. Change it only if alerts should go elsewhere (separate several with commas).

## 2. Run setup once
1. In the function menu next to **Run**, pick `setup`, then click **Run**.
2. Google asks for permission. Click **Review permissions**, choose your account, then **Advanced → Go to (project name)** → **Allow**.
   This lets the script add rows to this Sheet, save pitch decks to your Drive, and send emails from your account.
3. You'll now have an **Applications** tab with column headers and a Drive folder called **Founder Ventures — Pitch Decks**.

## 3. Deploy as a web app
1. Click **Deploy → New deployment**. Click the gear and choose **Web app**.
2. Set **Execute as: Me**, **Who has access: Anyone**. Click **Deploy**.
3. Copy the **Web app URL** (it ends in `/exec`).
4. Optional check: open that URL in a browser. You should see `"Founder Ventures application endpoint is running."`

## 4. Connect the website
Send the `/exec` URL to Claude, or paste it yourself into `index.html`:

```js
const APPLY_ENDPOINT = window.FV_APPLY_ENDPOINT || 'PASTE_URL_HERE';
```

## Reviewing applications
- Each application is one row. Use the **Status** column dropdown (New → Reviewing → Zoom pitch → Due diligence → Offer / Declined).
- **Pitch deck** links open the file in your Drive folder. Files stay private to you unless you share them.
- Share the Sheet and the Drive folder with reviewers as needed.

## Changing the script later
After editing `Code.gs`, use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.

## Limits
- Pitch decks up to 20 MB (PDF, PowerPoint or Keynote).
- Gmail accounts can send about 100 emails a day through scripts. Each application sends one alert plus one confirmation to the team.
