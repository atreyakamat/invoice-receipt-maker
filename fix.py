import re

with open(r'c:\Projects\invoice-receipt-maker\client\src\pages\LandingPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<Grid container spacing={6} alignItems="center">', '<Grid container spacing={6} sx={{ alignItems: "center" }}>')
content = content.replace('<Grid item xs={12} md={6}>', '<Grid size={{ xs: 12, md: 6 }}>')
content = content.replace('<Grid item xs={12} md={4}>', '<Grid size={{ xs: 12, md: 4 }}>')
content = content.replace('<Grid item xs={12} md={5}>', '<Grid size={{ xs: 12, md: 5 }}>')
content = content.replace('<Grid item xs={12} md={7}>', '<Grid size={{ xs: 12, md: 7 }}>')
content = content.replace('<Grid container spacing={8} alignItems="center">', '<Grid container spacing={8} sx={{ alignItems: "center" }}>')

with open(r'c:\Projects\invoice-receipt-maker\client\src\pages\LandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
