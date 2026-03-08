import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center space-y-6 p-4">
            <img src="/logo.svg" alt="Acrely" className="h-12" />
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">404 - Page Not Found</h2>
                <p className="text-muted-foreground max-w-md">
                    The page you're looking for doesn't exist or may have been moved.
                </p>
            </div>
            <div className="flex gap-3">
                <Button asChild>
                    <Link href="/">Return Home</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/portal/help">Get Help</Link>
                </Button>
            </div>
        </div>
    )
}
