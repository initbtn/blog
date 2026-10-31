#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
APP_DIR = os.path.join(BASE_DIR, "src", "app")
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(APP_DIR, exist_ok=True)

# Fonts
FONT_BOLD = "/usr/share/fonts/truetype/nanum/NanumSquareB.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/nanum/NanumSquareR.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def draw_pure_waffle_avatar(size=512):
    """
    Pure Bold Waffle Keycap Avatar:
    - Pure Waffle only (initbtn reset arrow symbol completely removed).
    - Vivid, warm Honey Gold (#fbbf24) & Rich Maple Amber (#b45309).
    - Crisp, thick 3x3 waffle grid matrix:
      Represents modular architecture, low coupling & high cohesion.
    - Deep mechanical keycap switch base (#0f172a slate with cyan chamfer).
    - High contrast, clearly readable even at 16x16 / 32x32 favicon scale!
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.06)
    r = int(size * 0.22)
    
    # 1. Outer Mechanical Keycap Base (#0f172a slate body with glowing cyan border)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=r,
        fill=(15, 23, 42, 255),
        outline=(56, 189, 248, 240),
        width=int(size * 0.024)
    )
    
    # 2. Keycap Bevel / Angled Slope
    slope_pad = int(size * 0.12)
    slope_r = int(size * 0.17)
    draw.rounded_rectangle(
        [slope_pad, slope_pad, size - slope_pad, size - slope_pad],
        radius=slope_r,
        fill=(24, 33, 54, 255),
        outline=(30, 41, 59, 255),
        width=int(size * 0.012)
    )
    
    # 3. Vivid Honey Gold Waffle Face (#fbbf24)
    plate_pad = int(size * 0.16)
    plate_r = int(size * 0.13)
    draw.rounded_rectangle(
        [plate_pad, plate_pad, size - plate_pad, size - plate_pad],
        radius=plate_r,
        fill=(251, 191, 36, 255),
        outline=(217, 119, 6, 255),
        width=int(size * 0.016)
    )
    
    # 4. Bold 3x3 Waffle Grid (All 9 pockets cleanly indented with deep caramel shadow)
    grid_start = plate_pad + int(size * 0.04)
    grid_end = size - plate_pad - int(size * 0.04)
    step = (grid_end - grid_start) / 3
    hole_size = step * 0.76
    pocket_r = int(size * 0.035)
    
    for row in range(3):
        for col in range(3):
            x1 = grid_start + col * step + (step - hole_size) / 2
            y1 = grid_start + row * step + (step - hole_size) / 2
            x2 = x1 + hole_size
            y2 = y1 + hole_size
            
            # Deep maple amber recessed cavity
            draw.rounded_rectangle([x1, y1, x2, y2], radius=pocket_r, fill=(180, 83, 9, 255))
            # Subtle warm inner highlight
            draw.rounded_rectangle([x1 + 3, y1 + 3, x2 - 2, y2 - 2], radius=pocket_r - 2, fill=(217, 119, 6, 255))
            
            # Center pocket gets an extra crisp waffle core highlight
            if row == 1 and col == 1:
                draw.rounded_rectangle([x1 + 6, y1 + 6, x2 - 6, y2 - 6], radius=pocket_r - 3, fill=(245, 158, 11, 255))
                # Micro dot in center
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2
                draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(254, 240, 138, 255))

    return img

def generate_icons(avatar):
    # 1. Avatar (512x512)
    avatar_path = os.path.join(PUBLIC_DIR, "avatar.png")
    avatar.save(avatar_path, "PNG", optimize=True)
    print(f"Generated {avatar_path} (512x512)")
    
    # 2. apple-touch-icon.png (180x180)
    apple_icon = avatar.resize((180, 180), Image.Resampling.LANCZOS)
    apple_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    apple_icon.save(apple_path, "PNG", optimize=True)
    print(f"Generated {apple_path} (180x180)")
    
    # 3. favicon.ico (multi-size 16, 32, 48) in BOTH public/ and src/app/
    ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    avatar.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    
    app_ico_path = os.path.join(APP_DIR, "favicon.ico")
    avatar.save(app_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated {ico_path} and {app_ico_path} (16, 32, 48 ico)")

def generate_og_image(avatar):
    """
    Requested Layout (Referencing busan-youth-day high readability & Safe Zone standard):
    - Background: Clean, Solid Deep Modern Dark (#0a0f1d) with zero grid pattern noise
    - Safe Zone: 100% of vital content safely contained within (x: 100~1100, y: 50~580)
      to prevent ANY cropping in KakaoTalk 2:1 mobile link card preview
    - Left: Sharp 3x3 Waffle Matrix Keycap (320px)
    - Right: High-contrast, clean typography (domlog, Full-Stack & AI Systems Builder, description, URL)
    """
    width = 1200
    height = 630
    
    # 1. Clean Deep Modern Slate/Navy solid background (Zero Grid Lines)
    img = Image.new("RGBA", (width, height), (10, 15, 29, 255))
    draw = ImageDraw.Draw(img)
    
    # Subtle elegant ambient accent glow (soft gradient)
    glow_canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_canvas)
    glow_draw.ellipse([(100, 100), (550, 530)], fill=(245, 158, 11, 24))
    glow_draw.ellipse([(650, 80), (1150, 550)], fill=(56, 189, 248, 22))
    glow_canvas = glow_canvas.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, glow_canvas)
    draw = ImageDraw.Draw(img)
    
    # Subtle outer safe border
    draw.rounded_rectangle([(32, 32), (width - 32, height - 32)], radius=24, outline=(30, 41, 59, 255), width=2)
    
    # ── LEFT: Waffle Keycap Avatar (Sized & Centered within Safe Zone) ──
    # Kakao safe area: y from 40 to 590 (height 550), x from 90 to 1110
    avatar_size = 320
    avatar_resized = avatar.resize((avatar_size, avatar_size), Image.Resampling.LANCZOS)
    avatar_x = 110
    avatar_y = (height - avatar_size) // 2
    
    # Backdrop frame for the avatar
    draw.rounded_rectangle(
        [avatar_x - 8, avatar_y - 8, avatar_x + avatar_size + 8, avatar_y + avatar_size + 8],
        radius=36,
        fill=(15, 23, 42, 255),
        outline=(56, 189, 248, 180),
        width=2
    )
    img.paste(avatar_resized, (avatar_x, avatar_y), avatar_resized)
    
    # ── RIGHT: Clean High-Contrast Typography ──
    text_x = 490
    content_y = 135
    
    # 1. Category Pill
    pill_font = get_font(FONT_BOLD, 14)
    pill_text = "TECH & ARCHITECTURE JOURNAL"
    pbbox = draw.textbbox((0, 0), pill_text, font=pill_font)
    pw = (pbbox[2] - pbbox[0]) + 26
    draw.rounded_rectangle([text_x, content_y, text_x + pw, content_y + 30], radius=15, fill=(15, 23, 42, 255), outline=(56, 189, 248, 180), width=1)
    draw.text((text_x + 13, content_y + 6), pill_text, font=pill_font, fill=(56, 189, 248, 255))
    
    # 2. Main Brand Name: domlog
    brand_font = get_font(FONT_BOLD, 68)
    draw.text((text_x, content_y + 48), "domlog", font=brand_font, fill=(255, 255, 255, 255))
    
    # 3. Modern Role Headline: Full-Stack & AI Systems Builder
    role_font = get_font(FONT_BOLD, 28)
    draw.text((text_x, content_y + 142), "Full-Stack & AI Systems Builder", font=role_font, fill=(56, 189, 248, 255))
    
    # 4. Value Statement / Description (Crisp White / Silver)
    desc_font = get_font(FONT_BOLD, 20)
    draw.text((text_x, content_y + 196), "낮은 결합도와 높은 응집도를 갖춘 모듈식 아키텍처", font=desc_font, fill=(241, 245, 249, 255))
    
    desc_sub_font = get_font(FONT_REGULAR, 19)
    draw.text((text_x, content_y + 234), "실무 시스템 엔지니어링과 트러블슈팅의 기록", font=desc_sub_font, fill=(186, 200, 222, 255))
    
    # 5. Domain / Link Footer
    url_font = get_font(FONT_BOLD, 18)
    draw.text((text_x, content_y + 296), "https://domlog.vercel.app", font=url_font, fill=(56, 189, 248, 255))

    out_path = os.path.join(PUBLIC_DIR, "og-image.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path} ({width}x{height})")

def generate_svg_favicon():
    """
    Crisp SVG Favicon: Pure Honey Gold Waffle with 3x3 Matrix
    """
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="6" y="6" width="88" height="88" rx="20" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
  <rect x="16" y="16" width="68" height="68" rx="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
  <!-- 3x3 Bold Waffle Grid -->
  <rect x="22" y="22" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="22" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="64" y="22" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="22" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="64" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="22" y="64" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="64" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="64" y="64" width="14" height="14" rx="3" fill="#b45309"/>
</svg>"""
    svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {svg_path}")

if __name__ == "__main__":
    avatar = draw_pure_waffle_avatar(512)
    generate_icons(avatar)
    generate_og_image(avatar)
    generate_svg_favicon()
