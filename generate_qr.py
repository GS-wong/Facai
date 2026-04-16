import qrcode
from PIL import Image, ImageDraw, ImageFont
import os

# 生成二维码
url = "https://GS-wong.github.io/Facai/index.html"
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# 创建二维码图像
qr_img = qr.make_image(fill_color="black", back_color="white")
qr_img = qr_img.convert('RGB')

# 创建海报背景
poster_width = 800
poster_height = 1000
poster = Image.new('RGB', (poster_width, poster_height), '#ff6b6b')
draw = ImageDraw.Draw(poster)

# 创建白色内容区域
content_margin = 40
content_width = poster_width - 2 * content_margin
content_height = poster_height - 2 * content_margin
content_area = Image.new('RGB', (content_width, content_height), 'white')
poster.paste(content_area, (content_margin, content_margin))

# 绘制标题
try:
    title_font = ImageFont.truetype("simhei.ttf", 48)
    subtitle_font = ImageFont.truetype("simhei.ttf", 24)
    hint_font = ImageFont.truetype("simhei.ttf", 20)
    url_font = ImageFont.truetype("simhei.ttf", 16)
except:
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    hint_font = ImageFont.load_default()
    url_font = ImageFont.load_default()

# 标题
title_text = "🏪 商场集章打卡"
bbox = draw.textbbox((0, 0), title_text, font=title_font)
title_width = bbox[2] - bbox[0]
draw.text(((poster_width - title_width) // 2, 100), title_text, fill='#333333', font=title_font)

# 副标题
subtitle_text = "打卡6家店铺，赢取神秘大奖！"
bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
subtitle_width = bbox[2] - bbox[0]
draw.text(((poster_width - subtitle_width) // 2, 170), subtitle_text, fill='#666666', font=subtitle_font)

# 粘贴二维码
qr_size = 400
qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
qr_x = (poster_width - qr_size) // 2
qr_y = 240
poster.paste(qr_img, (qr_x, qr_y))

# 二维码边框
border_width = 4
draw.rectangle([qr_x - border_width, qr_y - border_width, 
                qr_x + qr_size + border_width, qr_y + qr_size + border_width], 
               outline='#ff6b6b', width=border_width)

# 提示文字
hint_text = "微信扫码即可参与"
bbox = draw.textbbox((0, 0), hint_text, font=hint_font)
hint_width = bbox[2] - bbox[0]
draw.text(((poster_width - hint_width) // 2, 660), hint_text, fill='#999999', font=hint_font)

# 步骤说明
steps = [
    ("📸", "拍照打卡"),
    ("🏪", "6家店铺"),
    ("🎁", "兑换大奖")
]
step_y = 720
step_spacing = 200
start_x = (poster_width - (len(steps) - 1) * step_spacing) // 2

for i, (icon, text) in enumerate(steps):
    x = start_x + i * step_spacing
    # 图标
    bbox = draw.textbbox((0, 0), icon, font=subtitle_font)
    icon_width = bbox[2] - bbox[0]
    draw.text((x - icon_width // 2, step_y), icon, fill='#ff6b6b', font=subtitle_font)
    # 文字
    bbox = draw.textbbox((0, 0), text, font=hint_font)
    text_width = bbox[2] - bbox[0]
    draw.text((x - text_width // 2, step_y + 40), text, fill='#666666', font=hint_font)

# URL
url_text = url
bbox = draw.textbbox((0, 0), url_text, font=url_font)
url_width = bbox[2] - bbox[0]
draw.text(((poster_width - url_width) // 2, 880), url_text, fill='#999999', font=url_font)

# 保存海报
poster.save('stamp_checkin_poster.png', 'PNG')
print(f"海报已生成: stamp_checkin_poster.png")
print(f"扫码链接: {url}")
