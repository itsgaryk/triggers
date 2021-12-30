let streamConnection;
let streamDispatcher;

module.exports = function (file){

    const initDispatcher = (connection) => {
        
        streamDispatcher = connection.play(file), {
            volume: false,
            highWaterMark: 512,
            bitrate: 128,
            fec: true
        }
    
        streamDispatcher.setBitrate(128);
        streamDispatcher.setFEC(true);
    
        streamDispatcher.once("speaking", () => {
        })
    
        streamDispatcher.on("finish", () => {
        });	
    
        streamDispatcher.once("debug", e => {
        });
    
        streamDispatcher.on("disconnect", () => {
        });
    
        streamDispatcher.on("error", e => {
            console.log(e);
        });
    }

    function playStream(voice){
        if(streamConnection === null)
            voice.join()
            .then(async connection => {
                streamConnection = connection;
                connection.on("debug", e => {
                    if (e.includes('[WS] >>') || e.includes('[WS] <<')) return;
                    console.log("Status: Connection warning - " + e);
                    if(e.includes('[WS] closed')) commandStop();
                });
                connection.on("disconnect", () => {
                    console.log("Bot disconnected from channel");
                    commandStop();
                });
                connection.on("error", e => {
                    clientLogMessage("Status: Error. See logs");
                    console.log(e);
                    commandStop();
                });
                connection.on("finish", () => {
                    console.log("Left the voice channel")
                });
                initDispatcher(connection);
            })
            .catch(error => {
                console.log(error.code + "Error when trying to play");
            });
        else
            initDispatcher(streamConnection);
    }        
}

