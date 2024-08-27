import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
    useMutation, 
} from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { 
    deleteIngredient,
    getIngredientById
} from '@/lib/api'
import { toast } from 'sonner';
import { sanitizeString } from '../../lib/utils'
import { 
    type FetchedIngredient 
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/delete-ingredient/$ingredientId')({
    component: DeleteIngredient
})

function DeleteIngredient() {
    const { ingredientId } = Route.useParams();
    const id = parseInt(ingredientId);

    const [ingredientName, setIngredientName] = useState('');
    useEffect(() => {
        const fetchIngredientName = async () => {
            try {
                const fetchedIngredient: FetchedIngredient = await getIngredientById(ingredientId);
                const sanitizedIngredientName = sanitizeString(fetchedIngredient.ingredient.name);
                setIngredientName(sanitizedIngredientName);
            } catch (error) {
                console.error("Error fetching ingredient: ", error);
            }
        };

        fetchIngredientName();
    });

    return (
        <div className="p-16">
            <h2 className="text-center pt-4 text-xl text-red-500">Are you sure you want to delete</h2>
            <h2 className="text-center pb-4 text-xl text-red-500">the ingredient '{ingredientName}'?</h2>
            <DeleteIngredientButton id={id} name={ingredientName}/>
            <Button 
                onClick={() => window.history.back()}
                className="mx-auto flex"
            >
                Cancel
            </Button>
        </div>
    )
}

function DeleteIngredientButton({ id, name }: { id: number, name: string }) {
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: deleteIngredient,
        onError: (error) => {
            console.error('Error deleting ingredient: ', error);
            toast("Error", {
                description: error.message || `Failed to delete ingredient '${name}'`,
            });
        },
        onSuccess: () => {
            toast("Ingredient Deleted", {
                description: `Successfully deleted ingredient '${name}'`,
            })
            navigate({to: '/my-ingredients'});
        },
    });

    const handleDelete = () => {
        mutation.mutate({ id });
    }

    return (
        <Button
            onClick={handleDelete}
            className="my-8 mx-auto flex hover:bg-red-500"
        >
            {mutation.isPending ? "..." : <p>Delete Ingredient</p>}
        </Button>
    )
}