import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Problem } from "@shared/schema";

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.number().min(1, "Points must be at least 1"),
  circuitData: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string(),
      value: z.string()
    })),
    edges: z.array(z.object({
      source: z.string(),
      target: z.string()
    }))
  }),
  solution: z.object({
    timeConstant: z.number()
  })
});

type ProblemFormData = z.infer<typeof problemSchema>;

export function ProblemForm() {
  const { toast } = useToast();
  const form = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "Easy",
      points: 10,
      circuitData: {
        nodes: [
          { id: '1', type: 'resistor', value: '1k' },
          { id: '2', type: 'capacitor', value: '1uF' }
        ],
        edges: [
          { source: '1', target: '2' }
        ]
      },
      solution: {
        timeConstant: 0.001
      }
    }
  });

  const createProblem = useMutation({
    mutationFn: async (data: ProblemFormData) => {
      const res = await apiRequest("POST", "/api/problems", data);
      return res.json();
    },
    onSuccess: (problem: Problem) => {
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
      toast({
        title: "Success",
        description: "Problem created successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createProblem.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Simple RC Circuit" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Calculate the time constant of this RC circuit"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={createProblem.isPending}
        >
          Create Problem
        </Button>
      </form>
    </Form>
  );
}
