import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Zap } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  const loginForm = useForm({
    defaultValues: { username: "", password: "" },
    resolver: zodResolver(insertUserSchema)
  });

  const registerForm = useForm({
    defaultValues: { username: "", password: "" },
    resolver: zodResolver(insertUserSchema)
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Circuit Master
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(data => loginMutation.mutate(data))}>
                    <div className="space-y-4">
                      <Input
                        placeholder="Username"
                        {...loginForm.register("username")}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        {...loginForm.register("password")}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        Login
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(data => registerMutation.mutate(data))}>
                    <div className="space-y-4">
                      <Input
                        placeholder="Username"
                        {...registerForm.register("username")}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        {...registerForm.register("password")}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        Register
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center bg-primary/5 p-8">
        <Zap className="w-24 h-24 text-primary mb-8" />
        <h1 className="text-4xl font-bold text-center mb-4">
          Master Electrical Networks
        </h1>
        <p className="text-xl text-center text-muted-foreground max-w-md">
          Learn and practice circuit analysis through interactive problems and compete with others
        </p>
      </div>
    </div>
  );
}