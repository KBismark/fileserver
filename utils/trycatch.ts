export async function  TryCatch<R=any>(action: ()=>Promise<R>){
    const response: {result:R,errored:Error|boolean} = {result:undefined as any,errored:false};
    try {
      response.result = await action()
    } catch (error) {
      response.errored = error||true;
    }
    return response;
  }
  
