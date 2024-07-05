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
                <h1 className="text-2xl font-bold">Search</h1>
            </Link>
            <div className="flex gap-2">
                <Link to="/about" className="[&.active]:font-bold">
                    About
                </Link>
                <Link to="/my-recipes" className="[&.active]:font-bold">
                    My Recipes
                </Link>
                <Link to="/create-recipe" className="[&.active]:font-bold">
                    Create Recipe
                </Link>
                <Link to="/ingredients" className="[&.active]:font-bold">
                    Ingredients
                </Link>
                <Link to="/profile" className="[&.active]:font-bold">
                    Profile
                </Link>
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