export default function AuthReducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      return {
        currentUser: action.payload,
      };
    }
    default: {
      return state;
    }
  }
}
