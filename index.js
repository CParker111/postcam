// this is the cloudflare worker function that handles the post request from the client
// and uploads the image to the cloudflare worker kv store
// it also returns the url of the file to the client
import "../shared/moment.js"
import moment from "../shared/moment-timezone-with-data-10-year-range.js"
import { My_TZ, My_ttl } from "../shared/myconstants.js"

export async function onRequestPost(context) {
    try{
        // const timestamp = Date.now()

        // const maxcount = 1440
        let ttl = My_ttl;
        // get the api_key from the request header
        const api_key = context.request.headers.get('x-api-key')
        // check if the api_key is valid
        if(api_key !== context.env.API_KEY){
            return new Response("invalid api key")
        }
        
        // get the filename from the request header
        // const filename = context.request.headers.get('x-filename') 
        let xfilename = context.request.headers.get('x-filename')
        
        let xfilename_split = xfilename.split('_')
        // console.log(xfilename_split)
        // xfilename_split.splice(0, 1);

        const deviceid            = xfilename_split[0]
        const bootcount           = xfilename_split[1]
        const reference_bootcount = xfilename_split[2]
        const _epoch              = xfilename_split[3]



        const timestamp = parseInt(_epoch) * 1000
        const local_dateTime = moment.tz(
            timestamp, My_TZ).format("YYYY-MM-DD HH:mm:ss")
        
        

        // construct the keynames
        const file_keyname   = "jpg_" + deviceid + '_' + _epoch + ".jpg"
        const table_keyname = file_keyname.split('.')[0]



        // get the file from the request body
        const buf = await context.request.arrayBuffer()
        
        // put the file in the kv store
        await context.env.mykvns.put(file_keyname, buf, { expirationTtl: ttl })


        
// for debug
/*
        const defaultData = {}

        defaultData["Head"]=
        [
            "deviceid", "bootcount", "reference_bootcount",
            "local_dateTime" 
        ]

        defaultData[table_keyname] = 
        [
            deviceid, bootcount, reference_bootcount,
            local_dateTime 
        ];

        const cache = await context.env.mykvns.get(
                                    "00000_camuploadpic_all_table")
        if (!cache) {
            await context.env.mykvns.put("00000_camuploadpic_all_table",
                                        JSON.stringify(defaultData))
        } else {
            let data = JSON.parse(cache)
            
 
            data[table_keyname] = 
            [
                deviceid, bootcount, reference_bootcount,
                local_dateTime 
            ];
                
            await context.env.mykvns.put("00000_camuploadpic_all_table",
                                                JSON.stringify(data))
        }
*/



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