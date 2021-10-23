const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const app = express();
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
} = require('graphql');
const { nanoid } = require('nanoid');

let allTodos = [{
  id: 'first-test-todo',
  title: 'First test todo',
  completed: false
}];

let updatedTodos = [];
let removedTodos = [];
let newlyAddedTodos = [];

const TodoType = new GraphQLObjectType({
  name: 'Todo',
  description: 'This represents a todo',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    title: { type: GraphQLNonNull(GraphQLString) },
    completed: { type: GraphQLNonNull(GraphQLBoolean) },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    Todos: {
      type: new GraphQLList(TodoType),
      description: 'A list of all Todos',
      args: {
        search: { type: GraphQLString },
      },
      resolve: (parent, args) => (args.search) ? allTodos.filter((todo) =>
        args.search === todo.title) : allTodos
    },
    newlyAdded: {
      type: new GraphQLList(TodoType),
      description: 'A list of all Todos (recently addedTodos)',
      resolve: () => newlyAddedTodos,
    },
    updatedTodos: {
      type: new GraphQLList(TodoType),
      description: 'A list of all Todos (recently updatedTodos)',
      resolve: () => updatedTodos,
    },
    removedTodos: {
      type: new GraphQLList(TodoType),
      description: 'A list of all Todos (recently removedTodos)',
      resolve: () => removedTodos,
    }
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addNewTodo: {
      type: TodoType,
      description: 'Add a new todo',
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const todo = {
          id: nanoid(),
          title: args.title,
          completed: false
        };
        allTodos.push(todo);
        newlyAddedTodos.push(todo);
        return todo;
      },
    },
    updateNewTodo: {
      type: TodoType,
      description: 'Update todo by id',
      args: {
        id: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        let todo = allTodos
        for (let i = 0; i < allTodos.length; i++) {
          if (allTodos[i].id == args.id) {
            updatedTodos.push(allTodos[i]);
            allTodos[i].completed = !allTodos[i].completed;
            todo = allTodos[i];
            break;
          }
        }
        return todo;
      },
    },
    deleteNewTodo: {
      type: new GraphQLList(TodoType),
      description: 'Delete todo by id',
      args: {
        id: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        const removedTodo = allTodos.filter(({ id }) => args.id === id)
        removedTodos.push(removedTodo);
        allTodos = allTodos.filter(({ id }) => args.id !== id)

        return removedTodo;
      },
    }
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(4000, () => console.log(`Server running on port 4000`));