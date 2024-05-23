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
    title: z.string(),
    description: z.string().optional(),
    prepTime: z.number().int().positive().optional(),
    cookTime: z.number().int().positive().optional(),
    totalTime: z.number().positive(),
    servings: z.number().int().positive(),
    instructions: z.string(),
    url: z.string().optional()
});

type Recipe = z.infer<typeof recipeSchema>

const createPostSchema = recipeSchema.omit({id: true})

const fakeRecipes: Recipe[] = [
    {
        id: 1,
        title: "Spaghetti Bolognese",
        description: "A classic Italian pasta dish.",
        prepTime: 10,
        cookTime: 30,
        totalTime: 40,
        servings: 4,
        url: undefined,
        instructions: "1. Cook the pasta. 2. Prepare the sauce. 3. Combine and serve.",
        // ingredients: [
        //     { id: 1, name: "Spaghetti", quantity: 400, unit: "g" },
        //     { id: 2, name: "Ground Beef", quantity: 500, unit: "g" },
        //     { id: 3, name: "Tomato Sauce", quantity: 1, unit: "cup" },
        // ]
    },
    {
        id: 2,
        title: "Ravioli",
        description: "Another classic Italian pasta dish.",
        prepTime: 10,
        cookTime: 30,
        totalTime: 40,
        servings: 4,
        url: undefined,
        instructions: "1. Cook the pasta. 2. Prepare the sauce. 3. Combine and serve.",
        // ingredients: [
        //     { id: 1, name: "Spaghetti", quantity: 400, unit: "g" },
        //     { id: 2, name: "Ground Beef", quantity: 500, unit: "g" },
        //     { id: 3, name: "Tomato Sauce", quantity: 1, unit: "cup" },
        // ]
    }
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