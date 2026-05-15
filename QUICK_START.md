# ⚡ QUICK START - Deploy en 5 minutos

## 1. Crear Space en Hugging Face

```
https://huggingface.co/new-space
- Space name: sis-l-app
- SDK: Docker
- Create Space
```

## 2. Clonar y Copiar Archivos

```bash
git clone https://huggingface.co/spaces/TU_USUARIO/sis-l-app
cd sis-l-app
# Copiar archivos del proyecto aquí
```

## 3. Crear BD Externa (Railway)

1. https://railway.app → New Project → MySQL
2. Copiar `DATABASE_URL`
3. Extraer: `host`, `user`, `password`

## 4. Configurar en HF Spaces

**Settings → Secrets** (agregar 3 secretos):

```
DB_PASSWORD = [tu-password-de-railway]
JWT_SECRET = [algo-aleatorio-largo]
DB_HOST = [tu-host-de-railway.railway.app]
```

## 5. Push

```bash
git add .
git commit -m "Deploy SIS-L"
git push
```

✅ **Listo!** HF despliega automáticamente.

Verifica: https://tu-space.hf.space

---

## 🆘 Si algo falla

1. **Logs** → Ver error en HF Spaces dashboard
2. **BD** → Verificar que Railway está online
3. **Dockerfile** → Revisar sintaxis (puerto 7860 requerido)
4. **Variables** → Confirmar en HF Secrets

---

## ✨ Después del Deploy

```bash
# Hacer cambios locales
# ...

# Actualizar Space
git add .
git commit -m "Update"
git push
```

HF reconstruye automáticamente.

¡Hecho! 🎉
