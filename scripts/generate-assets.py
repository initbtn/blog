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

def draw_waffle_keycap_avatar(size=512):
    """
    Technical Simplicity & Architectural Elegance:
    - Mechanical Keyboard Keycap (the 'initbtn' switch)
    - Keycap top surface features a crisp 3x3 waffle grid matrix
      representing low coupling & high cohesion (Clean Architecture)
    - Center keycap recess has a sharp cyan LED reset arrow (⟲)
    - Modern dark slate + warm amber biscuit tone + electric cyan accent
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.08)
    r = int(size * 0.22)
    
    # 1. Outer Keycap Body (Deep Slate #0b1120 with chamfered edge)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=r,
        fill=(15, 23, 42, 255),
        outline=(56, 189, 248, 230),
        width=int(size * 0.022)
    )
    
    # 2. Keycap Bevel / Angled Slope
    slope_pad = int(size * 0.13)
    slope_r = int(size * 0.17)
    draw.rounded_rectangle(
        [slope_pad, slope_pad, size - slope_pad, size - slope_pad],
        radius=slope_r,
        fill=(24, 33, 54, 255),
        outline=(30, 41, 59, 255),
        width=int(size * 0.012)
    )
    
    # 3. Keycap Top Plate: Golden Waffle Biscuit Matrix (#f59e0b)
    plate_pad = int(size * 0.18)
    plate_r = int(size * 0.13)
    draw.rounded_rectangle(
        [plate_pad, plate_pad, size - plate_pad, size - plate_pad],
        radius=plate_r,
        fill=(245, 158, 11, 255),
        outline=(180, 83, 9, 255),
        width=int(size * 0.015)
    )
    
    # 4. 3x3 Keyboard Matrix / Waffle Grid
    grid_start = plate_pad + int(size * 0.04)
    grid_end = size - plate_pad - int(size * 0.04)
    step = (grid_end - grid_start) / 3
    hole_size = step * 0.76
    pocket_r = int(size * 0.03)
    
    cx = size // 2
    cy = size // 2
    
    for row in range(3):
        for col in range(3):
            if row == 1 and col == 1:
                continue
                
            x1 = grid_start + col * step + (step - hole_size) / 2
            y1 = grid_start + row * step + (step - hole_size) / 2
            x2 = x1 + hole_size
            y2 = y1 + hole_size
            
            draw.rounded_rectangle([x1, y1, x2, y2], radius=pocket_r, fill=(180, 83, 9, 255))
            draw.rounded_rectangle([x1 + 3, y1 + 3, x2 - 2, y2 - 2], radius=pocket_r - 2, fill=(217, 119, 6, 255))
            
            dot_cx = (x1 + x2) / 2
            dot_cy = (y1 + y2) / 2
            draw.ellipse([dot_cx - 4, dot_cy - 4, dot_cx + 4, dot_cy + 4], fill=(254, 240, 138, 200))
            
    # 5. Center Core: The 'initbtn' Key
    center_hole_size = step * 0.92
    hx1 = cx - center_hole_size / 2
    hy1 = cy - center_hole_size / 2
    hx2 = cx + center_hole_size / 2
    hy2 = cy + center_hole_size / 2
    
    draw.rounded_rectangle(
        [hx1, hy1, hx2, hy2],
        radius=pocket_r + 3,
        fill=(11, 15, 25, 255),
        outline=(56, 189, 248, 255),
        width=int(size * 0.016)
    )
    
    arc_radius = int(center_hole_size * 0.32)
    arc_box = [cx - arc_radius, cy - arc_radius, cx + arc_radius, cy + arc_radius]
    draw.arc(arc_box, start=50, end=310, fill=(56, 189, 248, 255), width=int(size * 0.024))
    
    arrow_size = int(size * 0.032)
    arrow_tip_x = cx + int(arc_radius * math.cos(math.radians(50)))
    arrow_tip_y = cy - int(arc_radius * math.sin(math.radians(50)))
    draw.polygon([
        (arrow_tip_x, arrow_tip_y - arrow_size),
        (arrow_tip_x + arrow_size, arrow_tip_y + int(arrow_size * 0.6)),
        (arrow_tip_x - int(arrow_size * 0.4), arrow_tip_y + int(arrow_size * 0.3))
    ], fill=(56, 189, 248, 255))
    
    draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(56, 189, 248, 220))

    return img

def generate_icons(avatar):
    avatar_path = os.path.join(PUBLIC_DIR, "avatar.png")
    avatar.save(avatar_path, "PNG", optimize=True)
    print(f"Generated {avatar_path} (512x512)")
    
    apple_icon = avatar.resize((180, 180), Image.Resampling.LANCZOS)
    apple_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    apple_icon.save(apple_path, "PNG", optimize=True)
    print(f"Generated {apple_path} (180x180)")
    
    ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    avatar.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    
    app_ico_path = os.path.join(APP_DIR, "favicon.ico")
    avatar.save(app_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated {ico_path} and {app_ico_path} (16, 32, 48 ico)")

def generate_og_image(avatar):
    """
    Minimalist Profile Card Thumbnail:
    - Pure, elegant, distraction-free profile card layout.
    - No walls of text or bullet points (cleared as requested).
    - Features ONLY:
        * Centered Waffle Keycap avatar (large & crisp)
        * 'domlog' & '@initbtn'
        * Title: 'Full-Stack & AI Systems Builder'
    - 100% KakaoTalk Half/Square crop and wide 16:9 safe.
    """
    width = 1200
    height = 630
    
    img = Image.new("RGBA", (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    # Subtle dark background gradient
    for y in range(height):
        ratio = y / height
        r = int(9 + (26 - 9) * ratio)
        g = int(13 + (36 - 13) * ratio)
        b = int(22 + (52 - 22) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Ambient radial light around the center
    cx = 600
    cy = 315
    glow_canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_canvas)
    glow_draw.ellipse([cx - 300, cy - 260, cx + 300, cy + 260], fill=(56, 189, 248, 30))
    glow_draw.ellipse([cx - 150, cy - 120, cx + 150, cy + 120], fill=(245, 158, 11, 22))
    glow_canvas = glow_canvas.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, glow_canvas)
    draw = ImageDraw.Draw(img)
    
    # Subtle grid lines
    grid_color = (255, 255, 255, 10)
    for x in range(0, width, 60):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 60):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)
        
    # Outer border
    draw.rectangle([(16, 16), (width - 16, height - 16)], outline=(56, 189, 248, 50), width=1)
    
    # ── Centered Pure Profile Card ──
    # 1. Large Crisp Avatar
    avatar_size = 230
    avatar_resized = avatar.resize((avatar_size, avatar_size), Image.Resampling.LANCZOS)
    avatar_x = cx - avatar_size // 2
    avatar_y = 110
    
    # Frame container behind avatar
    draw.rounded_rectangle(
        [avatar_x - 8, avatar_y - 8, avatar_x + avatar_size + 8, avatar_y + avatar_size + 8],
        radius=36,
        fill=(15, 23, 42, 230),
        outline=(56, 189, 248, 190),
        width=2
    )
    img.paste(avatar_resized, (avatar_x, avatar_y), avatar_resized)
    
    # 2. Main Title: domlog
    title_font = get_font(FONT_BOLD, 54)
    title_text = "domlog"
    tbbox = draw.textbbox((0, 0), title_text, font=title_font)
    tw = tbbox[2] - tbbox[0]
    draw.text((cx - tw // 2, avatar_y + avatar_size + 30), title_text, font=title_font, fill=(248, 250, 252, 255))
    
    # 3. Modern Role Headline: Full-Stack & AI Systems Builder
    role_font = get_font(FONT_BOLD, 26)
    role_text = "Full-Stack & AI Systems Builder"
    rbbox = draw.textbbox((0, 0), role_text, font=role_font)
    rw = rbbox[2] - rbbox[0]
    draw.text((cx - rw // 2, avatar_y + avatar_size + 98), role_text, font=role_font, fill=(56, 189, 248, 255))
    
    # 4. Identity Tag: @initbtn
    tag_font = get_font(FONT_REGULAR, 20)
    tag_text = "@initbtn"
    gbbox = draw.textbbox((0, 0), tag_text, font=tag_font)
    gw = gbbox[2] - gbbox[0]
    draw.text((cx - gw // 2, avatar_y + avatar_size + 138), tag_text, font=tag_font, fill=(148, 163, 184, 255))

    out_path = os.path.join(PUBLIC_DIR, "og-image.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path} ({width}x{height})")

def generate_svg_favicon():
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="6" y="6" width="88" height="88" rx="22" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
  <rect x="18" y="18" width="64" height="64" rx="14" fill="#f59e0b"/>
  <!-- 3x3 Grid Matrix -->
  <rect x="23" y="23" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="23" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="63" y="23" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="23" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <!-- Center initbtn key -->
  <rect x="41" y="41" width="18" height="18" rx="4" fill="#0b0f19" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 50 44 A 4.5 4.5 0 1 1 46 47" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
  <rect x="63" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="23" y="63" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="63" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="63" y="63" width="14" height="14" rx="3" fill="#b45309"/>
</svg>"""
    svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {svg_path}")

if __name__ == "__main__":
    avatar = draw_waffle_keycap_avatar(512)
    generate_icons(avatar)
    generate_og_image(avatar)
    generate_svg_favicon()
