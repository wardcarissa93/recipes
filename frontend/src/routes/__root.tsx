import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { type QueryClient } from "@tanstack/react-query"

interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: Root,
})

function NavBar() {
    return (
        <div className="p-2 flex gap-2 max-w-2xl m-auto items-baseline">
            <Link to="/" className="[&.active]:font-bold">
                Home
            </Link>
            <Link to="/about" className="[&.active]:font-bold">
                About
            </Link>
            <Link to="/recipes" className="[&.active]:font-bold">
                Recipes
            </Link>
            <Link to="/create-recipe" className="[&.active]:font-bold">
                Create
            </Link>
            <Link to="/profile" className="[&.active]:font-bold">
                Profile
            </Link>
        </div>
    )
}

function Root() {
    return (
        <>
            <NavBar/>
            <hr />
            <div className="p-2 max-w-2xl m-auto">
                <Outlet/>
            </div>
        </>
    )
}