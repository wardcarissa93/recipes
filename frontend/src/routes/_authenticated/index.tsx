import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/')({
    component: Index
})

  function Index() {
  
    return (
      <div className="p-2">
          <h1 className="text-5xl font-bold text-indigo-400 text-center mt-32 mb-20">Recipe Box</h1>
          <Link to="/my-recipes">
              <Button className="mx-auto flex">
                  My Recipes
              </Button>
          </Link>
          <Link to="/my-ingredients">
              <Button className="mt-8 mx-auto flex">
                  My Ingredients
              </Button>
          </Link>
      </div>
    )
  }