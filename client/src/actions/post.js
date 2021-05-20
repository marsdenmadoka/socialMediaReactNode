import axios from 'axios';
import {setAlert} from './alert'

import{
GET_POSTS,
POST_ERROR,
UPDATE_LIKES,
DELETE_POST,
ADD_POST,
GET_POST
} from './types'

//Get posts
export const getPosts = () => async dispatch =>{
    try {
        const res = await axios.get('/api/posts');
        dispatch({
            type:GET_POSTS,
            payload:res.data
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
          });
    }
}

//Add likes
export const addLike = postId => async dispatch =>{
    try {
        const res = await axios.put(`/api/posts/like/${postId}`);
        dispatch({
            type:UPDATE_LIKES,
            payload:{  postId , likes:res.data} //id=post id 
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
          });
    }
}

//remove likes
export const removeLike = postId => async dispatch =>{
    try {
        const res = await axios.put(`/api/posts/unlike/${postId}`);
        dispatch({
            type:UPDATE_LIKES,
            payload:{ postId , likes:res.data} //id=post id 
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
          });
    }
}

//delete post
export const deletePost = id => async dispatch =>{
    try {
        const res = await axios.delete(`/api/posts/${id}`);//id=post id
        dispatch({
            type:DELETE_POST,
            payload:id //id=post id
        })
        dispatch(setAlert('postRemoved','success'))
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
          });
    }
}


//add post
export const addPost = formData => async dispatch =>{
    const config={
        headers:{
            'Content-Type':'application/json'
        }
    }
    try {
        const res = await axios.post('/api/posts',formData,config);
        dispatch({
            type:ADD_POST,
            payload:res.data
        })
        dispatch(setAlert('post created','success'))
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
          });
    }
}
//Get post byId
export const getPost = id => async dispatch =>{
    try {
        const res = await axios.get(`/api/posts/${id}`);
        dispatch({
            type:GET_POST,
            payload:res.data
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
          });
    }
}