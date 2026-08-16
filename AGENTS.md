# Project Notes

## Quả địa cầu trang welcome — khoa CN&KT ĐH Đồng Tháp

- URL: `https://cnkt.dthu.edu.vn/welcome` (tự redirect về `/` sau ~26s; dùng localStorage/visited để bỏ qua lần sau)
- Quả địa cầu 3D được render bởi **Three.js** qua canvas WebGL: `WelcomeScene_canvas__B4XJV` (1920×842)
- Component: `WelcomeScene` (CSS modules: `WelcomeScene_canvas__B4XJV`, `WelcomeScene_vignette__mY0WP`, ...)
- Chunk code: `/_next/static/chunks/app/welcome/page-1068fde7f132dab3.js`
- Đặc điểm:
  - Các hình cầu tự xoay: `rotation.x += 0.1*e`, `rotation.y += 0.15*e`
  - OrbitControls: `autoRotate: true`, `rotateSpeed: 0.6`, `minDistance 5` / `maxDistance 14`, `enablePan: false`; chạm/drag thì tạm dừng auto-rotate, quay lại sau 4s
  - Texture radial gradient xanh (`rgba(168,208,245,...)` → `rgba(77,166,255,0)`) tạo quầng sáng quanh quả cầu
- Cách kiểm chứng bằng DevTools: `document.querySelectorAll('canvas')` + `getContext('webgl')`; fetch chunk + tìm `WebGLRenderer`/`requestAnimationFrame`/`getContext`
