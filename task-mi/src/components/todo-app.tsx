"use client";

import { useState, useEffect } from "react";
import { TodoHeader } from "./todo-header";
import { TodoInput } from "./todo-input";
import { TodoList } from "./todo-list";
import { TodoFilters } from "./todo-filters";
import { TodoStats } from "./todo-stats";
import type { Todo, TodoFilter } from "@/lib/types";

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("todos");
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch (error) {
        console.error("[v0] Failed to parse todos from localStorage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = (title: string, description?: string, dueDate?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      dueDate,
      createdAt: new Date().toISOString(),
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const updateTodo = (
    id: string,
    updates: Partial<Omit<Todo, "id" | "createdAt">>
  ) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    );
  };

  const reorderTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-16">
      <TodoHeader />
      <div className="mt-8 space-y-6">
        <TodoInput onAdd={addTodo} />
        <TodoStats
          total={todos.length}
          active={todos.filter((t) => !t.completed).length}
          completed={todos.filter((t) => t.completed).length}
        />
        <TodoFilters
          currentFilter={filter}
          onFilterChange={setFilter}
          onClearCompleted={clearCompleted}
          hasCompleted={todos.some((t) => t.completed)}
        />
        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
          onReorder={reorderTodos}
        />
      </div>
    </div>
  );
}
