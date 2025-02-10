import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const OverView = () => {
  return (
      <div className="flex ">
        <Card className="flex-1 mr-4">
              <CardContent>
                <h1>OverView</h1>
            </CardContent>
          </Card>
          <Button>Create Project</Button>
    </div>
  )
}

export default OverView