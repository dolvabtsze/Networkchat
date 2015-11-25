function wifiConnect() {
    var openSettings = new MozActivity({
        name: "configure",
        data: {
            target: "device",
            section: "wifi"
        }
    });
}
document.getElementById("wificonnect").addEventListener("click", wifiConnect);




var duration = 500;

function durationChangeOn() {
    duration = 500;
    navigator.vibrate(duration);

}
function durationChangeOff() {
    duration = 0;

}

document.getElementById("vibraon").addEventListener("click", durationChangeOn);
document.getElementById("vibraoff").addEventListener("click", durationChangeOff);


function exitApp() {
    window.close();
}

document.getElementById("exit").addEventListener("click", exitApp);

var TabStorage = window.localStorage;
var Database = window.indexedDB;
if (TabStorage.length > 0) {
    var lep = 3;
    while (lep < TabStorage.length + 3) {
        var ip = TabStorage.getItem(lep);
        createTab(ip);
        lep++;
    }
}

var ize = 0;
var maxLoops = TabStorage.length;
(function next() {
    if (ize++ >= maxLoops)
        return;

    setTimeout(function () {
        var ip = document.getElementById("ip" + (ize + 2)).value;
        var DatabaseOpen = Database.open(ip, 1);
        DatabaseOpen.onsuccess = function () {

            var DB = this.result;
            var Trans = DB.transaction(ip, "readonly");

            Trans.oncomplete = function () {
                DB.close();
            };
            var IDBObjectStore_oswt = Trans.objectStore(ip);

            var IDBRequest_Kreq1 = IDBObjectStore_oswt.openCursor();
            IDBRequest_Kreq1.onsuccess = function (evt) {
                var IDBCursorWithValue_cursor = evt.target.result;

                if (IDBCursorWithValue_cursor) {
                    var li = document.createElement("li");
                    li.innerHTML = IDBCursorWithValue_cursor.value.Message;
                    li.id = IDBCursorWithValue_cursor.value.Idd;
                    var outMes = document.getElementById("texts" + (ize + 1));
                    outMes.insertBefore(li, outMes.childNodes[0]);
                    IDBCursorWithValue_cursor.continue();
                } else {
                    console.log("All items are listed");
                }

            };

            IDBRequest_Kreq1.onerror = function () {
                console.log("Error while reading the messages");
            };


        };

        next();
    }, 350);
})();





function showText(ev) {
    var currentTab = ev.target.getAttribute("currenttab");
    var li = document.createElement("li");
    if (document.getElementById("text" + currentTab).value.length > 0) {
        li.innerHTML = document.getElementById("text" + currentTab).value;
        li.id = "out";
        var outMes = document.getElementById("texts" + currentTab);
        outMes.insertBefore(li, outMes.childNodes[0]);

    }
}

function sendData(ev) {
    var currentTab = ev.target.getAttribute("currenttab");
    var ip = document.getElementById("ip" + currentTab).value;
    var data = document.getElementById("text" + currentTab).value;
    if (data.length > 0) {

        var socket = navigator.mozTCPSocket.open(ip, 1603);
        socket.onopen = function () {

            socket.send(data);
        };
        socket.onclose = function () {
            document.getElementById("text" + currentTab).value = "";
        };
    }
}


function addDataToDatabase(ev) {
    var currentTab = ev.target.getAttribute("currenttab");
    var ip = document.getElementById("ip" + currentTab).value;
    var data = document.getElementById("text" + currentTab).value;
    if (data.length > 0) {
        var DatabaseOpen = Database.open(ip, 1);
        DatabaseOpen.onsuccess = function () {
            var DB = this.result;

            var Trans = DB.transaction(ip, "readwrite");
            Trans.oncomplete = function () {
                DB.close();
            };
            var ObjectStore = Trans.objectStore(ip);
            ObjectStore.put({Message: document.getElementById("text" + currentTab).value, Idd: "out"});
        };
        DatabaseOpen.onerror = function () {
            console.log("Error while opening the database");

        };
    }
}







var socketServer = navigator.mozTCPSocket.listen(1603);

socketServer.onconnect = function (conn) {
    conn.ondata = function (ev) {
        if (ev.data !== null) {
            console.log(conn);
            console.log(ev);
            var ip = conn.host;
            var data = ev.data;
            //mainpage
            var li = document.createElement("li");
            li.innerHTML = ip + " : " + data;
            var newMes = document.getElementById("newmessages");
            newMes.insertBefore(li, newMes.childNodes[0]);
            //chatpages
            var countItems = document.getElementById("tabs").childElementCount;
            var ok = 0;
            while (countItems > 2) {
                var sIP = document.getElementById("ip" + countItems).value;
                if (conn.host === sIP) {
                    var li2 = document.createElement("li");
                    li2.innerHTML = data;
                    li2.id = "in";
                    var inMes = document.getElementById("texts" + countItems);
                    inMes.insertBefore(li2, inMes.childNodes[0]);
                    ok = 1;
                }
                countItems--;
            }
            if (ok === 0) {
                createTab(conn.host);
                var li2 = document.createElement("li");
                li2.innerHTML = data;
                li2.id = "in";
                var inMes = document.getElementById("texts" + (countItems + 1));
                inMes.appendChild(li2);

            }
            var DatabaseOpen = Database.open(ip, 1);
            DatabaseOpen.onsuccess = function () {
                var DB = this.result;

                var Trans = DB.transaction(ip, "readwrite");
                Trans.oncomplete = function () {
                    DB.close();
                };
                var ObjectStore = Trans.objectStore(ip);
                ObjectStore.put({Message: data, Idd: "in"});
            };
            DatabaseOpen.onerror = function () {
                console.log("Error while opening the database");

            };
            navigator.vibrate(duration);
            //max
            newMes.removeChild(newMes.childNodes[5]);
        }

    };
};


function removeTab(ev) {
    var currentTab = parseInt(ev.target.getAttribute("currenttab"));
    TabStorage.removeItem(currentTab);
    document.getElementById("ip" + currentTab);
    document.getElementById("panel" + currentTab).remove();
    var DatabaseDelete = Database.deleteDatabase(ip);
    DatabaseDelete.onsuccess = function () {
        console.log("Succesfully deleted the database");
    };

    DatabaseDelete.onerror = function () {
        console.log("Error while deleting database");
    };

//renames
    var countItems = document.getElementById("tabs").childElementCount;
    if (countItems + 1 > currentTab) {
        var i = currentTab + 1;
        while (i <= countItems + 1) {
            var setPanel = document.getElementById("panel" + i);
            setPanel.id = "panel" + (i - 1);
            var setA = document.getElementById("tab" + i);
            setA.id = "tab" + (i - 1);
            setA.setAttribute("href", "#panel" + (i - 1));
            setA.setAttribute("aria-controls", "tabpanel" + (i - 1));
            var setDiv = document.getElementById("tabpanel" + i);
            setDiv.id = "tabpanel" + (i - 1);
            setDiv.setAttribute("aria-labelledby", "tab" + (i - 1));
            var setInput = document.getElementById("ip" + i);
            setInput.id = "ip" + (i - 1);
            var setTextarea = document.getElementById("text" + i);
            setTextarea.id = "text" + (i - 1);
            var setButton1 = document.getElementById("send" + i);
            setButton1.id = "send" + (i - 1);
            setButton1.setAttribute("currenttab", (i - 1));
            var setButton2 = document.getElementById("delete" + i);
            setButton2.id = "delete" + (i - 1);
            setButton2.setAttribute("currenttab", (i - 1));
            var setUl2 = document.getElementById("texts" + i);
            setUl2.id = "texts" + (i - 1);
            var modItem = TabStorage.getItem(i);
            TabStorage.setItem((i - 1), modItem);
            TabStorage.removeItem(i);
            i++;
        }


    }
}


function createTab() {
    var IP = arguments[0];
    var countItems = document.getElementById("tabs").childElementCount;
    var createItem = countItems + 1;


    if (IP.length > 0) {

        //mainli
        var mainLi = document.createElement("li");
        mainLi.id = "panel" + createItem;
        mainLi.setAttribute("role", "presentation");
        //mainA
        var mainA = document.createElement("a");
        mainA.id = "tab" + createItem;
        mainA.setAttribute("href", "#panel" + createItem);
        mainA.setAttribute("role", "tab");
        mainA.setAttribute("aria-controls", "tabpanel" + createItem);
        mainA.innerHTML = IP;
        //mainDiv
        var mainDiv = document.createElement("div");
        mainDiv.id = "tabpanel" + createItem;
        mainDiv.setAttribute("class", "bb-tabpanel");
        mainDiv.setAttribute("role", "tabpanel");
        mainDiv.setAttribute("aria-labelledby", "tab" + createItem);
        //emptyDiv
        var emptyDiv = document.createElement("div");
        emptyDiv.setAttribute("class", "empty");
        //createSection
        var createSection = document.createElement("section");
        createSection.setAttribute("class", "gaia-list fit scroll sticky");
        var childUl1 = document.createElement("ul");
        var childLi = document.createElement("li");
        var childP = document.createElement("p");
        //childInput
        var childInput = document.createElement("input");
        childInput.id = "ip" + createItem;
        childInput.setAttribute("type", "text");
        childInput.setAttribute("placeholder", "To(IP)");
        childInput.setAttribute("value", IP);
        childInput.disabled = true;
        //childTextarea
        var childTextarea = document.createElement("textarea");
        childTextarea.id = "text" + createItem;
        childTextarea.setAttribute("placeholder", "Message");
        //childButton
        var childButton = document.createElement("button");
        childButton.id = "send" + createItem;
        childButton.setAttribute("currenttab", createItem);
        childButton.setAttribute("class", "sendbuttonom");
        childButton.innerHTML = "Send";
        childButton.addEventListener("click", showText);
        childButton.addEventListener("click", sendData);
        childButton.addEventListener("click", addDataToDatabase);

        //backtomain
        var backtomain = document.createElement("a");
        backtomain.setAttribute("href", "#panel2");
        backtomain.setAttribute("class", "backtomain");
        //childButton2
        var childButton2 = document.createElement("button");
        childButton2.id = "delete" + createItem;
        childButton2.setAttribute("currenttab", createItem);
        childButton2.setAttribute("class", "deletebuttonom");
        childButton2.innerHTML = "Remove Tab";
        childButton2.addEventListener("click", removeTab);

        //childUl2
        var childUl2 = document.createElement("ul");
        childUl2.id = "texts" + createItem;




        document.getElementById("tabs").appendChild(mainLi);
        document.getElementById("panel" + createItem).appendChild(mainA);
        document.getElementById("panel" + createItem).appendChild(mainDiv);
        mainDiv.appendChild(emptyDiv);
        mainDiv.appendChild(createSection);
        createSection.appendChild(childUl1);
        childUl1.appendChild(childLi);
        childLi.appendChild(childP);
        childP.appendChild(childInput);
        childP.appendChild(childTextarea);
        childP.appendChild(childButton);
        childP.appendChild(backtomain);
        backtomain.appendChild(childButton2);
        createSection.appendChild(childUl2);


    }
}

function addTabDatabase() {
    var IP = arguments[0];
    var countItems = document.getElementById("tabs").childElementCount;
    TabStorage.setItem(countItems, IP);
    var DatabaseOpen = Database.open(IP, 1);
    DatabaseOpen.onupgradeneeded = function (evt) {
        var DB = evt.target.result;
        var ObjectStore = DB.createObjectStore(IP, {keyPath: "Id", autoIncrement: true});
        var Index1 = ObjectStore.createIndex("Id", "Id", {unique: true});

    };
    DatabaseOpen.onsuccess = function (ev) {
        var DB = this.result;
        DB.close();
    };

}

document.getElementById("newtab").addEventListener("click", function () {
    var IP = document.getElementById("IP").value;
    createTab(IP);
});
document.getElementById("newtab").addEventListener("click", function () {
    var IP = document.getElementById("IP").value;
    addTabDatabase(IP);
});

window.onunload = function () {
    socketServer.close();
};