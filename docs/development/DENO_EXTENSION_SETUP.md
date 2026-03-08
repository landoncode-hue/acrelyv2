# 🔧 VSCode Deno Extension Setup

## Current Status

Your VSCode settings have been configured to use Deno for the `supabase/functions` directory. However, you may still see errors if the **Deno VSCode extension** is not installed.

---

## ✅ Quick Fix: Install Deno Extension

### Option 1: Install via VSCode (Recommended)

1. Open VSCode
2. Press `Cmd+Shift+X` (macOS) to open Extensions
3. Search for **"Deno"** (by Deno Land)
4. Click **Install**
5. Reload VSCode window (`Cmd+Shift+P` → "Reload Window")

### Option 2: Install via Command Line

```bash
code --install-extension denoland.vscode-deno
```

---

## 🔍 Verify Installation

After installing the extension:

1. Open `/Users/lordkay/Development/acrely/supabase/functions/generate-receipt/index.ts`
2. The Deno import errors should disappear
3. You should see "Deno" in the bottom status bar when viewing edge function files

---

## ⚙️ Your Current Configuration

The following settings have been added to `.vscode/settings.json`:

```json
{
    "deno.enable": true,
    "deno.enablePaths": [
        "./supabase/functions"
    ],
    "deno.lint": true,
    "deno.unstable": []
}
```

This tells VSCode:
- ✅ Enable Deno for the `supabase/functions` directory only
- ✅ Use Deno's type checker and linter
- ✅ Keep the rest of your project using Node.js/TypeScript

---

## 🎯 What This Fixes

### Before (Without Deno Extension)
```
❌ Cannot find module 'https://deno.land/std@0.168.0/http/server.ts'
❌ Cannot find module 'https://esm.sh/@supabase/supabase-js@2.39.3'
❌ Cannot find name 'Deno'
```

### After (With Deno Extension)
```
✅ All imports resolved correctly
✅ Full IntelliSense for Deno APIs
✅ Proper type checking
✅ No errors in IDE
```

---

## 🚨 Important Notes

1. **Deno is only enabled for `supabase/functions`**
   - The rest of your project still uses Node.js/TypeScript
   - This is intentional and correct

2. **The extension is required**
   - Without it, VSCode can't understand Deno's URL imports
   - The code will still work when deployed, but IDE will show errors

3. **Reload after installation**
   - Always reload VSCode after installing the extension
   - This ensures the settings take effect

---

## 🔗 Extension Link

**Deno for Visual Studio Code**
- Publisher: Deno Land
- Extension ID: `denoland.vscode-deno`
- [Marketplace Link](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

---

## ✅ Checklist

- [ ] Install Deno VSCode extension
- [ ] Reload VSCode window
- [ ] Open `supabase/functions/generate-receipt/index.ts`
- [ ] Verify no TypeScript errors appear
- [ ] Check status bar shows "Deno" when viewing edge functions

---

## 🆘 Troubleshooting

### Still seeing errors after installing?

1. **Reload VSCode:** `Cmd+Shift+P` → "Developer: Reload Window"
2. **Check extension is active:** Look for "Deno" in bottom status bar
3. **Verify settings:** Open `.vscode/settings.json` and confirm Deno settings are present
4. **Clear cache:** `Cmd+Shift+P` → "Developer: Reload Window"

### Deno enabled for wrong files?

The `deno.enablePaths` setting ensures Deno is **only** used for:
- `./supabase/functions/**/*`

All other files use regular TypeScript/Node.js checking.

---

**Last Updated:** 2026-01-16  
**Status:** Configuration complete - Extension installation required
