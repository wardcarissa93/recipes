import { createFileRoute, Outlet } from "@tanstack/react-router";
import { userQueryOptions } from "@/lib/api";
import { Button } from "@/components/ui/button";

const Login = () => {
    return (
        <div className="p-2">
            <h1 className="text-5xl font-bold text-indigo-400 text-center mt-32 mb-20">Recipe Box</h1>
            <a href="/api/register">
                <Button className="mx-auto flex w-[84px]">
                    Register
                </Button>
            </a>
            <a href="/api/login">
                <Button className="mt-8 mx-auto flex w-[84px]">
                    Login
                </Button>
            </a>
        </div>
    )
}

const Component = () => {
    const { user } = Route.useRouteContext();
    if (!user) {
        return <Login/>;
    }
    return <Outlet/>;
}

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({ context }) => {
        const queryClient = context.queryClient;
        try {
            const data = await queryClient.fetchQuery(userQueryOptions);
            return data;
        } catch (e) {
            return { user: null };
        }
    },
    component: Component
});