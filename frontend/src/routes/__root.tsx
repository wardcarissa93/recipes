import { 
    createRootRouteWithContext, 
    Link, 
    Outlet 
} from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { type QueryClient } from "@tanstack/react-query"

interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: Root,
})

function NavBar() {
    return (
        <div className="p-2 flex justify-between  m-auto items-baseline">
            <Link to="/search">
                <h1 className="text-2xl font-bold hover:text-indigo-400">Search</h1>
            </Link>
            <div className="flex gap-4">
                <Link to="/my-recipes" className="[&.active]:font-bold hover:text-indigo-400">
                    My Recipes
                </Link>
                <Link to="/create-recipe" className="[&.active]:font-bold hover:text-indigo-400">
                    Create Recipe
                </Link>
                <Link to="/ingredients" className="[&.active]:font-bold hover:text-indigo-400">
                    Ingredients
                </Link>
                <a href="/api/logout" className="hover:text-indigo-400">Logout</a>
            </div>
        </div>
    )
}

function Root() {
    return (
        <>
            <NavBar/>
            <hr />
            <div className="p-2 m-auto">
                <Outlet/>
            </div>
            <Toaster />
        </>
    )
}