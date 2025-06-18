let websocketUrl = (process.env.NODE_ENV === 'development') ? 'ws://localhost:3001' : 'ws://react-survivor-3da68f32f376.herokuapp.com';

export default websocketUrl;