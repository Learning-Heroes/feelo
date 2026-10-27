### 💬 Prompts

**1. Prompt de plan (plan mode)**

```markdown
# Tarea
Implementa la tarea de Notion «[App] — Implementar el flujo
de autenticación con email y contraseña sobre Supabase».
Link: https://app.notion.com/p/App-Implementar-el-flujo-de-autenticaci-n-con-email-y-contrase-a-sobre-Supabase-7763ee77283f4f5b9c4907b24f5aca04?source=copy_link
Hoy: datos, cliente y sesión, login y registro.
Fuera: confirmación por email (desactivada), recuperar
contraseña, deep links y tests E2E.

# Modo
Plan mode. No edites ningún fichero todavía.

# Qué quiero en el plan
1. Fases en orden de dependencia, con checkpoint al final.
2. Por fase: ficheros que creas o tocas y comandos.
3. Por checkpoint: cómo demuestro que funciona.
4. Decisiones abiertas: pregunta, no supongas.
5. Qué no vas a tocar.
```





**2. Reglas de ejecución por checkpoints** (se envía al aprobar el plan)

```markdown
# Reglas de ejecución
- Ejecuta solo la fase en la que estamos.
- Al acabar la fase, para y enséñame:
  ficheros cambiados, comandos y su salida,
  y el resultado de la verificación del plan.
- Nada de db push sin mi OK: es el proyecto cloud.
- Si algo te obliga a salirte del plan, para y pregunta.
- Con mi OK: commit de la fase y pasas a la siguiente.
```

**3. Frases de redirección** (tras Esc)

```markdown
Para. Eso no está en el plan.
Revierte el cambio y sigue con la fase actual.

Vuelve al plan: estamos en la fase 2.
Las pantallas son de la fase 3.

No toques la RLS para que pase.
La fila la crea el trigger; la app no inserta.

Llevas tres intentos con el mismo error.
Para, explícame la causa y propón dos opciones.
```