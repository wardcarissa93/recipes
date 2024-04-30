import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// type Expense = {
//     id: number,
//     title: string,
//     amount: number
// }

const expenseSchema = z.object({
    id: z.number().int().positive().min(1),
    title: z.string().min(3).max(100),
    amount: z.number().positive()
})

type Expense = z.infer<typeof expenseSchema>

const createPostSchema = expenseSchema.omit({id: true})

const fakeExpenses: Expense[] = [
    { id: 1, title: "Expense 1", amount: 100},
    { id: 2, title: "Expense 2", amount: 200},
    { id: 3, title: "Expense 3", amount: 300}
];

export const expensesRoute = new Hono()
.get("/", async (c) => {
    return c.json({ expenses: fakeExpenses })
})
.post("/", zValidator("json", createPostSchema), async (c) => {
    const expense = await c.req.valid("json")
    fakeExpenses.push({...expense, id: fakeExpenses.length+1})
    return c.json(expense)
})
.get("/:id{[0-9]+}", (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const expense = fakeExpenses.find(expense => expense.id === id)
    if (!expense) {
        return c.notFound()
    }
    return c.json({expense})
})
.delete("/:id{[0-9]+}", (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const index = fakeExpenses.findIndex(expense => expense.id === id)
    if (index === -1) {
        return c.notFound();
    }
    const deletedExpense = fakeExpenses.splice(index, 1)[0];
    return c.json({ expense: deletedExpense });
})