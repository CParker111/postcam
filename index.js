export default {
    async fetch(request, env) {
    const result = await env.
data.prepare(
      "SELECT state from cam_control",
    ).run();
    return new Response(JSON.stringify(result));
  }
}

export async function onRequestPost(context) {
    try{
             
        // get the filename from the request header
        // const filename = context.request.headers.get('x-filename') 
        let xfilename = context.request.headers.get('x-filename')
        

        const file_keyname   = "jpg_" + xfilename + ".jpg"
  

        // get the file from the request body
        const buf = await context.request.arrayBuffer()

        // put the file in the kv store
        await context.env.mykvns.put(file_keyname, buf)


        let message = {}

        message = {
            "uniqueid": "CAMUPLOADPIC-SUCCESS",
            "message": "success",
        }
        const json = JSON.stringify(message, null, 2);
        return new Response(json, {
            headers: {
                "content-type": "application/json;charset=UTF-8"
            },
        });
    }
    catch(err){
        // return new Response(err)
        const err_json = {
            "uniqueid": "CAMUPLOADPIC-ERROR",
            "message": err.toString(),
        }
        const json = JSON.stringify(err_json , null, 2);
        return new Response(json, {
            headers: {
                "content-type": "application/json;charset=UTF-8"
            },
        });
    }
}
