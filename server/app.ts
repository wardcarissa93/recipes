import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { recipesRoute } from './routes/recipes'
import { authRoute } from './routes/auth'

const app = new Hono()

app.use('*', logger())

app.get("/test", c => {
    return c.json({"message": "test"})
})

const apiRoutes = app.basePath("/api").route("/recipes", recipesRoute).route("/", authRoute)

app.get('*', serveStatic({ root: './frontend/dist' }))
app.get('*', serveStatic({ path: './frontend/dist/index.html' }))

export default app
export type ApiRoutes = typeof apiRoutes