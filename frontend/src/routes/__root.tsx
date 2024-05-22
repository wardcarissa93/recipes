import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
    component: Root,
});

function NavBar() {
    return (
        <div className="p-2 flex gap-2">
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
        </div>
    )
}

function Root() {
    return (
        <>
            <NavBar/>
            <hr />
            <Outlet/>
        </>
    )
}