import urllib.request
import os

url = "https://v11-weba.douyinvod.com/eea9c5868847769cb138f64cb3602541/69e35a9d/video/tos/cn/tos-cn-ve-15/oEMefLJVAHo27G5fEyACdzzf5tID5dx0AQE6IR/?a=6383&br=1912&bt=1912&btag=80000e00020000&cd=0%7C0%7C0%7C3&ch=26&cquery=100o_100w_100B_100x_100z&cr=3&cs=0&cv=1&dr=0&ds=4&dy_q=1776496695&feature_id=46a7bb47b4fd1280f3d3825bf2b29388&ft=EwB_4ERR0si0C4kDn2Ncg9~XtMFoBaQEe-yLfCT7WC6nnwLEH6KM&l=202604181518153CECC85E42762C671FAA&lr=all&mime_type=video_mp4&qs=0&rc=ODg8ZzlmaTs1ZTo5N2doO0BpM3l5Z3g5cmV5dzMzNGkzM0AuX180LzVgNTYxMDUxNDZjYSNtNTBiMmRrZnBgLS1kLWFzcw%3D%3D&temp=1&__vid=7456265717671873819"

req = urllib.request.Request(url)
req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
req.add_header('Referer', 'https://www.douyin.com/')

try:
    with urllib.request.urlopen(req) as response:
        content = response.read()
        with open('public/videos/video1.mp4', 'wb') as f:
            f.write(content)
        print("Download successful! Saved to public/videos/video1.mp4")
except Exception as e:
    print("Download failed:", e)