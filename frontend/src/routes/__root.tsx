import { 
    createRootRouteWithContext, 
    Link, 
    Outlet 
} from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { type QueryClient, useQuery } from "@tanstack/react-query"
import { userQueryOptions } from "@/lib/api"

interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: Root,
})

function NavBar() {
    const { data } = useQuery(userQueryOptions);

    return (
        <div className="p-2 flex justify-between  m-auto items-baseline">
            <div className="flex gap-4">
                <Link to="/search" className="[&.active]:font-bold [&.active]:text-indigo-400 hover:text-indigo-400">
                    Search
                </Link>
                <Link to="/my-recipes" className="[&.active]:font-bold [&.active]:text-indigo-400 hover:text-indigo-400">
                    My Recipes
                </Link>
                <Link to="/my-ingredients" className="[&.active]:font-bold [&.active]:text-indigo-400 hover:text-indigo-400">
                    My Ingredients
                </Link>
            </div>
            {data ? (
                <div className="flex gap-4">
                    <p>Welcome, {data.user.given_name} {data.user.family_name}</p>
                    <a href="/api/logout" className="hover:text-indigo-400">Logout</a>
                </div>
            ) : (
                <div className="flex gap-4">
                    <a href="/api/register" className="hover:text-indigo-400">Register</a>
                    <a href="/api/login" className="hover:text-indigo-400">Login</a>
                </div>
            )}
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