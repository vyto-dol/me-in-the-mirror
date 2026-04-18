# Me In The Mirror

App tạo poster minh hoa cho hoc sinh bang Gemini sau khi cac em chon xong thong tin, tinh cach va phu kien.

## Flow

1. Landing
   - `Student Name`
   - `Class Code`
   - `Gender`
2. Personality
   - `The Proud`
   - `The Myth`
   - `The Upgrade`
   - `The weakness`
   - `The change`
3. Decorate
   - Chon phu kien
   - Bam `Generate Image`
   - Gemini tao 1 anh hoan chinh gom nhan vat, text va accessories
   - Bam `Download Poster` de tai anh xuong

## Chay local

1. Tao file `.env.local` tu `.env.local.example`
2. Dien `GEMINI_API_KEY`
3. Chay:

```bash
npm start
```

4. Mo:

```text
http://localhost:3000
```

## Environment

- `GEMINI_API_KEY`: Gemini API key
- `GEMINI_IMAGE_MODEL`: mac dinh la `gemini-2.5-flash-image`
- `PORT`: mac dinh la `3000`
- `HOST`: mac dinh la `0.0.0.0`

## Deploy tren Dokploy

Repo da co `Dockerfile`, nen co the deploy theo kieu `Application` tu GitHub.

1. Import repo GitHub nay vao Dokploy
2. Chon branch `main`
3. Build type: `Dockerfile`
4. Dockerfile path: `./Dockerfile`
5. Port trong container: `3000`
6. Them environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image`
7. Gan domain cho app va bam deploy

## Ghi chu

- Key duoc giu o server qua `server.js`, frontend khong goi Gemini truc tiep.
- App nay phu hop voi deploy dang server app tren Dokploy hon la GitHub Pages tinh.
