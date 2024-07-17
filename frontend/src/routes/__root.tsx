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
            <div className="flex gap-4">
                <Link to="/search" className="[&.active]:font-bold hover:text-indigo-400">
                    Search
                </Link>
                <Link to="/my-recipes" className="[&.active]:font-bold hover:text-indigo-400">
                    My Recipes
                </Link>
                <Link to="/my-ingredients" className="[&.active]:font-bold hover:text-indigo-400">
                    My Ingredients
                </Link>
                {/* <a href="/api/logout" className="hover:text-indigo-400">Logout</a> */}
            </div>
            <div>
                <Link to="/profile" className="[&.active]:font-bold hover:text-indigo-400">
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