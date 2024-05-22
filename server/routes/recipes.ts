import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// type Expense = {
//     id: number,
//     title: string,
//     amount: number
// }

const recipeSchema = z.object({
    id: z.number().int().positive().min(1),
    title: z.string().min(3).max(100),
    amount: z.number().positive()
})

type Recipe = z.infer<typeof recipeSchema>

const createPostSchema = recipeSchema.omit({id: true})

const fakeRecipes: Recipe[] = [
    { id: 1, title: "Expense 1", amount: 100},
    { id: 2, title: "Expense 2", amount: 200},
    { id: 3, title: "Expense 3", amount: 300}
];

export const recipesRoute = new Hono()
.get("/", async (c) => {
    return c.json({ recipes: fakeRecipes })
})
.post("/", zValidator("json", createPostSchema), async (c) => {
    const recipe = await c.req.valid("json")
    fakeRecipes.push({...recipe, id: fakeRecipes.length+1})
    return c.json(recipe)
})
// .get("total-spent", async (c) => {
//     await new Promise((r) => setTimeout(r, 2000))
//     const total = fakeRecipes.reduce((acc, recipe) => acc + recipe.amount, 0);
//     return c.json({ total })
// })
.get("/:id{[0-9]+}", (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const recipe = fakeRecipes.find(recipe => recipe.id === id)
    if (!recipe) {
        return c.notFound()
    }
    return c.json({recipe})
})
.delete("/:id{[0-9]+}", (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const index = fakeRecipes.findIndex(recipe => recipe.id === id)
    if (index === -1) {
        return c.notFound();
    }
    const deletedRecipe = fakeRecipes.splice(index, 1)[0];
    return c.json({ recipe: deletedRecipe });
})