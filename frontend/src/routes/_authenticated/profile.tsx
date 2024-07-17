import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { userQueryOptions } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { sanitizeString } from '../../lib/utils'

export const Route = createFileRoute('/_authenticated/profile')({
    component: Profile
})

function Profile() {
    const { isPending, error, data } = useQuery(userQueryOptions);

    if (isPending) return "loading"
    if (error) return "not logged in"

    return (
        <div className="p-2">
            <Button onClick={() => window.history.back()}>
                Back
            </Button>
            <div className="flex gap-4 p-4 justify-center items-center">
                {data.user.picture && (
                    <Avatar>
                        <AvatarImage src={data.user.picture} alt={sanitizeString(data.user.given_name)}/>
                    </Avatar>
                )}
                <h2>{sanitizeString(data.user.given_name)} {sanitizeString(data.user.family_name)} is currently logged in.</h2>
            </div>
            <Button asChild className="mt-8 mx-auto flex w-[83px]">
                <a href="/api/logout">Logout?</a>
            </Button>
        </div>
    )
}