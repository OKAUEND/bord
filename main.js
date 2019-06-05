//スレッドデータ管理クラス
class thread
{
    // Firefoxだと未対応なのでコメントアウト;;
    // _page_type;
    // _thread_id;
    // _response_list;
    // _last_database_id;
    // _last_update_time;
    // _last_res_no;

    constructor()
    {
        this._page_type = 'thread'; 
        this._thread_id = 0;
        this._response_list = [];
        this._last_database_id = 0;
        this._last_update_time = null;
        this._last_res_no = 0;
        this._initial_load = false;
        this._IsAjaxProcsessing  = false;
    }

    set threadinfo(array)
    {
        let data = array[array.length - 1]
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

    set IsAjaxProcsessing(bool)
    {
        this._IsAjaxProcsessing = bool;
    }

    get IsAjaxProcsessing()
    {
        return this._IsAjaxProcsessing;
    }

    createFetchThread()
    {
        const sendingdata = 
        'fetch_mode='        + encodeURIComponent('all')   + '&' +  
        'page_type='         + encodeURIComponent(this._page_type)   + '&' +
        'thread_id='         + encodeURIComponent(this._thread_id)   + '&' +
        'last_res_no='       + encodeURIComponent(this._last_res_no) + '&' +  
        'last_res_time='     + encodeURIComponent(this._last_update_time) ;

        return sendingdata;
    }

    createFerchSingleData(resno)
    {
        const sendingdata = 
        'fetch_mode='        + encodeURIComponent('single')   + '&' +  
        'page_type='         + encodeURIComponent(this._page_type)   + '&' +
        'thread_id='         + encodeURIComponent(this._thread_id)   + '&' +
        'last_res_no='       + encodeURIComponent(resno) + '&' +  
        'last_res_time='     + encodeURIComponent(this._last_update_time) ;

        return sendingdata;
    }

}

const thread_data = new thread;

window.addEventListener('load',function(){

    const submit = document.querySelector("#btnsubmit");
    const js_drawer = document.querySelector('.js-drawer');
    const reload = document.querySelector('.js-reload');

    let loading_wait = false;

    //初回読み込み
    fetchCommentdata(thread_data.createFetchThread()).then((result) =>
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
            return fetchCommentdata(thread_data.createFetchThread());
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
        if(loading_wait)
        {
            return false;
        }
        const icon_reload = document.querySelector('.icon-reload');
        icon_reload.classList.add('__loading');
        loading_wait = true;

        fetchCommentdata(thread_data.createFetchThread()).then((result) =>
        {
            if(result.length = 0)
            {
                loading_wait = false;
                icon_reload.classList.remove('__loading');
                return;
            }
            appendDOMFragment(createDOMFragment(result,thread_data),thread_data);
            loading_wait = false;
            icon_reload.classList.remove('__loading');
        })
        .catch((err) =>
        {
            //エラー表示をモーダル画面で表示する(予定)
            icon_reload.classList.remove('__loading');
            loading_wait = false;
        })
    },false);

    js_drawer.addEventListener('click',() =>
    {
        document.querySelector('#main-form').classList.toggle('--hidden');
        document.querySelector('.js-drawer').classList.toggle('__open');
        document.querySelector('.icon-formopen').classList.toggle('__open');
    },false);


    const scrollUpperBottom = document.querySelector('.js-userinterface__item','.js-scrollupper');
    const activationLowerLimit = 200;

    scrollUpperBottom.addEventListener('click',() =>
    {
        //200未満は画面の移動をさせない
        if(document.documentElement.scrollTop < activationLowerLimit)
        {
            return;
        }

            //画面の描写位置をトップに戻す 
            document.documentElement.scrollTop = 0;

    },false);

    window.document.addEventListener('scroll' ,() =>
    {
        //200未満はボタンの表示を半透明にし、押せない事を表現
        if(document.documentElement.scrollTop < activationLowerLimit)
        {
            scrollUpperBottom.classList.add('__inactive')
            return;
        }
        else
        {
            //200以上は押せることを表現
            scrollUpperBottom.classList.remove('__inactive')
        }
    },false);

    
},false);

//非同期スレッド内容取得処理
function fetchCommentdata(sendingdata)
{
    return new Promise(function(resolve,reject)
    {
        let xhr = new XMLHttpRequest();
        xhr.open('POST','fetchAjax.php',true);
        xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');


        xhr.send(
            sendingdata
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
    document.querySelector('.main__body').appendChild(DOMFragment);
    console.log('おわった？');
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
        $ResNo.appendChild(document.createTextNode('No:' + response_No));

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

        //削除用ボタンを作成
        let $button_delete = document.createElement('button');
        $button_delete.classList.add('js-resdelete',element['ID']);
        //モーダルウィンドウ展開のためのイベントリスナーを登録
        $button_delete.addEventListener('click',deleteModalWindowOpen,false);

        //削除アイコンを追加
        let $i_delete_icon = document.createElement('i');
        $i_delete_icon.classList.add('icon-compose','icon-delete');
        $button_delete.appendChild($i_delete_icon);

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
        $div.appendChild($button_delete);

        //仮想ツリーにbodyを挿入
        fragment.appendChild($div);
    });

    thread_data.responseNo = response_No;

    return fragment;
}
// イベントハンドラーを登録し、動的に生成したボタンでもイベントを発火できるようにする
function deleteModalWindowOpen(event)
{
    const DeleteMessagetitle = 'この書き込みを削除しますか？';
    const DeleteSubmitButtomText = '削除';
    const SubmitButtomDelete = '__deleting';
    const DOMResNo= event.path[1].classList[1];

    //モーダルウィンドウを表示する関数へ
    modalWindowOpen(DeleteMessagetitle,DeleteSubmitButtomText,SubmitButtomDelete);

    document.querySelector('.modalwindow__text').classList.remove('--hidden');

    if(thread_data.IsAjaxProcsessing)
    {
        //前の非同期通信が行われているため、処理を行わせない
        return;
    }

    //削除内容を表示する処理を行う
    ShowDeletingContent(DOMResNo)
}

function modalWindowOpen(titleText,buttonText,submitClassName)
{
    //モーダルウィンドウを展開する処理へ変更
    //モーダルウィンドウ表示時はスクロールを行えないように設定
    //スクロールバーを非表示に
    document.querySelector('#body').classList.add('__is-show');
    //モーダルウィンドウの各種を表示
    document.querySelector('.modalwindow').classList.remove('--is_show');
    document.querySelector('.modalwindow__body').classList.remove('--is_show');
    document.querySelector('.modalwindow__back').classList.remove('--is_active');

    //タイトルを設定する
    document.querySelector('.title_text').appendChild(document.createTextNode(titleText));

    const modalSubmitbutton = document.querySelector('.modalSubmitButtom');
    //Submitボタンの名前を設定する
    modalSubmitbutton.appendChild(document.createTextNode(buttonText));

    //Submitのクラス名を設定する
    modalSubmitbutton.classList.add(submitClassName);

    //モーダルウィンドウのバック黒画面をクリックしたときのイベントを追加する
    document.querySelector('.modalwindow__back').addEventListener('click',modalWindowClose,false);
}

function modalWindowClose()
{
    //スクロールバーを表示する
    document.querySelector('#body').classList.remove('__is-show');

    //モーダルウィンドウを非表示に
    document.querySelector('.modalwindow').classList.add('--is_show');
    document.querySelector('.modalwindow__body').classList.add('--is_show');
    document.querySelector('.modalwindow__back').classList.add('--is_active');

    //モーダルウィンドウのタイトル部分にあたるテキストを削除する
    const modalWindowTitleText = document.querySelector('.title_text');
    modalWindowTitleText.removeChild(modalWindowTitleText.firstChild);

    //Submit用ボタンのテキストを削除する
    const modalSubmitbutton = document.querySelector('.modalSubmitButtom');
    modalSubmitbutton.removeChild(modalSubmitbutton.firstChild);

    //Submit用ボタンのスタイル指定を解除する
    const classList = modalSubmitbutton.classList;
    modalSubmitbutton.classList.remove(classList[classList.length -1]);

    //表示しているアイテムをすべて削除する
    const modalWindowNodeList = document.querySelector('.modalwindow__item');
    modalWindowNodeList.textContent = null;

    //削除キー入力欄が表示されていた場合、非表示にする
    const modalwindowDelInputform = document.querySelector('.modalwindow__text');
    if(!modalwindowDelInputform.classList.contains('--hidden'))
    {
        modalwindowDelInputform.classList.add('--hidden');
    }

    //モーダルウィンドウのバック黒画面をクリックしたときのイベントを削除
    document.querySelector('.modalwindow__back').removeEventListener('click',modalWindowClose,false);
}

function ShowDeletingContent(DOMResNo)
{
    //連続クリックで処理が重複しないように、非同期処理中である事を示すフラグをONにする
    thread_data.IsAjaxProcsessing = true;

    //読み込み中マークを生成する
    let modalItem = document.querySelector('.modalwindow__item');
    let $iconReload = document.createElement('i');
    $iconReload.classList.add('icon-compose','icon-reload','__loading');
    modalItem.appendChild($iconReload);

    //DBからコメントを再取得する
    fetchCommentdata(thread_data.createFerchSingleData(DOMResNo)).then((result) => 
    {
        modalItem.removeChild(modalItem.firstChild);
        let $response_text = document.createElement('p');
        $response_text.classList.add('view_text');
        $response_text.appendChild(document.createTextNode(result[0]['comment']));

        let $resoponse_time = document.createElement('p');
        $resoponse_time.classList.add('main-content__text','__time');
        $resoponse_time.appendChild(document.createTextNode(result[0]['create_data']));

        modalItem.appendChild($response_text);
        modalItem.appendChild($resoponse_time);

        //すべての処理が終わったため、フラグをOFFにする
        thread_data.IsAjaxProcsessing = false;
    })
    .catch(($err)=>
    {
        //すべての処理が終わったため、フラグをOFFにする
        thread_data.IsAjaxProcsessing = false;
    })
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


