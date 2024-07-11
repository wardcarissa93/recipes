import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { userQueryOptions } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { sanitizeString } from '../../utils/sanitizeString'

export const Route = createFileRoute('/_authenticated/profile')({
    component: Profile
})

function Profile() {
    const { isPending, error, data } = useQuery(userQueryOptions);

    if (isPending) return "loading"
    if (error) return "not logged in"

    return (
        <div className="p-2">
            <div className="flex items-center gap-2">
                <Avatar>
                    {data.user.picture && (
                        <AvatarImage src={data.user.picture} alt={sanitizeString(data.user.given_name)}/>
                    )}
                    <AvatarFallback>{sanitizeString(data.user.given_name)}</AvatarFallback>
                </Avatar>
                <p>
                    {sanitizeString(data.user.given_name)} {sanitizeString(data.user.family_name)}
                </p>
            </div>
            <Button asChild className="my-4">
                <a href="/api/logout">Logout</a>
            </Button>
        </div>
    )
}