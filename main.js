window.addEventListener('load',function(){

    const thread_data = new thread;
    let submit = document.querySelector("#btnsubmit");
    let js_drawer = document.querySelector('.js-drawer');
    let reload = document.querySelector('.js-reload');
    let delbtn = document.querySelector('#btndelete');


    //初回読み込み
    fetchCommentdata(thread_data).then((result) =>
    {
        let DOMFragment;

        DOMFragment = createDOMFragment(result,thread_data)
        newCommentDOM(DOMFragment,thread_data);
        thread_data.threadinfo = result;
    });

    //データベースへ登録する 書き込みをする
    submit.addEventListener('click',function(){
        console.log('クリック');
        let comment = document.querySelector(".comment").value;

        var wait = false;
        if(comment.length == 0 && wait)
        {
            return false;
        }

        wait = true;
        let input_list = [];
        input_list['username'] = document.querySelector(".username").value;
        input_list['email'] = document.querySelector(".email").value;
        input_list['deletepass'] = document.querySelector(".deletepass").value;
        input_list['comment'] = comment;

        let tmp = thread_data.threadinfo;

        let list = Object.assign(input_list,tmp);

        insertInputData(list).then(() =>
        {
            return fetchCommentdata(thread_data);
        })
        .then((result) => 
        {
            if(result.length < 0)
            {
                wait = false;
                return;
            }
            appendDOMFragment(createDOMFragment(result,thread_data),thread_data);
            wait = false;
        })
        .catch((err) =>
        {
            //エラー表示をモーダル画面で表示する(予定)
            wait = false;
        });
    },false);

    //更新ボタン押下時のスレッド内容読み取り
    reload.addEventListener('click' ,() =>
    {
        let wait = false;

        if(wait)
        {
            return false;
        }

        wait = true;
        fetchCommentdata(thread_data).then((result) =>
        {
            if(result.length = 0)
            {
                wait = false;
                return;
            }
            appendDOMFragment(createDOMFragment(result,thread_data),thread_data);
            thread_data.threadinfo = data;
            wait = false;
        })
        .catch((err) =>
        {
            //エラー表示をモーダル画面で表示する(予定)
            wait = false;
        })
    },false);

    //削除ボタン
    // delbtn.addEventListener('click',() =>
    // {
    //     let delete_text = document.querySelector('.delete_pas').value;

    //     //削除パスワードを入力されていないときは処理を終了する
    //     //製作中はコメント化をして判定を省く
    //     // if(delete_text.length == 0)
    //     // {
    //     //     return;
    //     // }

    //     let response_id_list = []; 

    //     //チェックした返信レスのIDをピックアップする
    //     for(let count = 0; count < document.comment_area.delete_check.length ; count++)
    //     {
    //         if(document.comment_area.delete_check[count].checked)
    //         {
    //             response_id_list.push(document.comment_area.delete_check[count].value);
    //         }
    //     }

    //     //該当レスIDがデータベースに存在するかを検索する
    //     searchRecode(thread_data,response_id_list).then((result) =>
    //     {

    //         //サーバーから取得したIDが、ピックアップしたレスのIDと合致しているか
    //         let isIncludes  = result.every((value) =>
    //         {
    //             return (response_id_list.includes(value['ID']))
    //         })

    //         //選んでいたレスがすべてサーバーに存在する場合、削除処理を実施
    //         if(isIncludes)
    //         {
    //             //削除処理を行う
    //             deleteRecode(thread_data.threadinfo,response_id_list);
    //         }
    //     })
    //     .then((result) =>
    //     {
    //         let isIncludes;
    //     })
    //     .catch((err) =>
    //     {
    //         console.log('サバエラー');
    //     })

    // },false);

    js_drawer.addEventListener('click',() =>
    {
        document.querySelector('#main-form').classList.toggle('__hidden');
        document.querySelector('.js-drawer').classList.toggle('__open');
        document.querySelector('.icon-formopen').classList.toggle('__open');
    },false);

},false);

//非同期スレッド内容取得処理
function fetchCommentdata(thread_data)
{
    return new Promise(function(resolve,reject)
    {
        let xhr = new XMLHttpRequest();
        xhr.open('POST','fetchAjax.php',true);
        xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
        //現在のスレッド情報を取得する
        let Threadinfo = thread_data.threadinfo;

        xhr.send(
            'page_type='         + encodeURIComponent(Threadinfo['page_type'])   + '&' +
            'thread_id='         + encodeURIComponent(Threadinfo['thread_id'])   + '&' +
            'last_res_no='       + encodeURIComponent(Threadinfo['last_database_id']) + '&' +  
            'last_res_time='     + encodeURIComponent(Threadinfo['last_update_time']) 
        );

        xhr.onreadystatechange = function()
        {
            switch(xhr.readyState)
            {
                case 4:
                    if(xhr.status == 200)
                    {
                        let data = JSON.parse(xhr.responseText);
                        resolve(data);
                    }
                    else if(xhr.status == 500)
                    {
                        reject('500')
                    }
                    break;
            }
        }
    })
}

//非同期スレッド内容書き込み処理
function insertInputData($array)
{
    return new Promise(function(resolve,reject)
    {
        let req = new XMLHttpRequest();
        req.open('POST','insertAjax.php',true);
        req.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
        req.send(
            'name='         + encodeURIComponent($array['username'])      + '&' +
            'email='        + encodeURIComponent($array['email'])         + '&' +
            'delete_pass='  + encodeURIComponent($array['deletepass'])    + '&' +
            'comment='      + encodeURIComponent($array['comment'])       + '&' +
            'thread_id='    + encodeURIComponent($array['thread_id'])     + '&' +
            'last_database_id='+ encodeURIComponent($array['last_database_id']),
            );

        req.onreadystatechange = function()
        {
            switch(req.readyState)
            {
                case 4:
                    if(req.status == 200)
                    {
                        let result = JSON.parse(req.responseText);
                        resolve(result);
                    }
                    break;
            }
        }
    })
}

function deleteRecode(threadinfo,data)
{
    return new Promise((resolve,reject) =>
    {
        let xhr = new XMLHttpRequest();
        xhr.open('POST','deleteAjax.php',true);
        xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');

        xhr.send(
            'thread_id=' + encodeURIComponent(threadinfo['thread_id']) + '&' + 
            'data='      + encodeURIComponent(data)
        );
    
        xhr.onreadystatechange = function()
        {
            switch(xhr.readyState)
            {
                case 4:
                    if(xhr.status == 200)
                    {
                        let data = JSON.parse(xhr.responseText);
                        resolve(data);
                    }
                    break;
            }
        }
    })
}

function searchRecode(thread_data,data)
{
    return new Promise((resolve,reject) =>
    {
        let xhr = new XMLHttpRequest();
        xhr.open('POST','searchAjax.php',true);
        xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
        xhr.send(
            'thread_id=' + encodeURIComponent(thread_data.threadinfo['thread_id']) + '&' + 
            'data='      + encodeURIComponent(data)
        );
    
        xhr.onreadystatechange = function()
        {
            switch(xhr.readyState)
            {
                case 4:
                    if(xhr.status == 200)
                    {
                        let data = JSON.parse(xhr.responseText);

                        resolve(data);
                    }
                    break;
            }
        }
    })
}

function newCommentDOM(DOMFragment)
{
   let $section = document.createElement('section');
   $section.classList.add('main__body');
   $section.classList.add('__show');
   $section.appendChild(DOMFragment);

   let comment_area = document.querySelector('#main-content');
   comment_area.appendChild($section);
}

function appendDOMFragment(DOMFragment)
{
    let comment_area = document.querySelector('.main__body');
    comment_area.appendChild(DOMFragment);
}

function createDOMFragment(fetchdata,thread_data)
{
    let fragment = document.createDocumentFragment();  
    let response_No = thread_data.responseNo;

   //取得した配列をループで回し、DOMを作成し表示する
    fetchdata.forEach(element => {

        response_No += 1;

        if(element['delete_flg'])
        {
            return;
        }

        //レスのbody部分を作成する
        let $div = document.createElement('div');
        $div.classList.add('main-content__item');

        //掲示板の通しNOを作成する
        let $ResNo = document.createElement('span');
        $ResNo.classList.add('main-content__text');
        $ResNo.appendChild(document.createTextNode('No ' + response_No));

        //データベースのIDを表示する
        let $DB_no = document.createElement('span');
        $DB_no.classList.add('main-content__text','__dbnumber');
        $DB_no.appendChild(document.createTextNode('No:' + element['ID']));

        //投稿者名を作成
        let $span_username   = document.createElement('span');
        $span_username.appendChild(document.createTextNode(element['username']));
        $span_username.classList.add('main-content__text','__name');

        //投稿時間を作成
        let $span_writingtime = document.createElement('span');
        $span_writingtime.appendChild(document.createTextNode(element['create_data']));
        $span_writingtime.classList.add('main-content__text','__time');

        //レスを作成
        let $p_comment = document.createElement('p');
        $p_comment.appendChild(document.createTextNode(element['comment']));
        $p_comment.classList.add('main-content__text');

        //作成したDOMをbodyタグに挿入
        $div.appendChild($ResNo);
        $div.appendChild($p_comment);
        $div.appendChild($DB_no);
        $div.appendChild($span_username);
        $div.appendChild($span_writingtime);

        //仮想ツリーにbodyを挿入
        fragment.appendChild($div);
    });

    thread_data.responseNo = response_No;

    return fragment;
}

function createErrorDOM()
{
    let fragment = document.createDocumentFragment(); 
    //レスのbody部分を作成する
    let $div = document.createElement('div');
    $div.classList.add('main-content__body');

    let $box = document.createElement('div');
    $box.classList.add('main-content__item');
    $box.classList.add('__error');

    //エラーアイコンを生成する
    let $error_icon = document.createElement('i');
    $error_icon.classList.add('icon-compose')
    $error_icon.classList.add('icon-error')

    //文字列を生成する
    let $error_txt   = document.createElement('p');
    $error_txt.appendChild(document.createTextNode('内容を取得できませんでした。時間を置いて再度更新を行ってください'));
    $error_txt.classList.add('main-content__errortxt');

    $box.appendChild($error_icon);
    $box.appendChild($error_txt);

    $div.appendChild($box);

    //仮想ツリーにbodyを挿入
    fragment.appendChild($div);

    return fragment;
}

//スレッドデータ管理クラス
class thread
{
    _page_type;
    _thread_id;
    _response_list;
    _last_database_id;
    _last_update_time;
    _last_res_no;

    constructor()
    {
        this._page_type = 'thread'; 
        this._thread_id = 0;
        this._response_list = [];
        this._last_database_id = 0;
        this._last_update_time = null;
        this._last_res_no = 0;
    }

    set threadinfo(array)
    {
        let data = array[array.length - 1]
        console.log(array);
        this._last_database_id = Number(data['ID']);
        this._last_update_time = data['create_data'];
    }

    get threadinfo()
    {
        let result = [];
        result['page_type']     = this._page_type;
        result['thread_id']     = this._thread_id;
        result['last_database_id']  = this._last_database_id;
        result['last_update_time'] = this._last_update_time;
        return result;
    }

    set responseNo(res_no)
    {
        this._last_res_no = res_no;
    }
    get responseNo()
    {
        return this._last_res_no;
    }
}

