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
        this._last_database_id = 0;
        this._last_update_time = null;
        this._last_res_no = 0;
        this._IsAjaxProcsessing  = false;
        this._DeletingPlanID = 0;
        this._activationLowerLimit = 200;
        this._closeSecTime = 5000;
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

    set DeletingID(ID)
    {
        this._DeletingPlanID = ID;
    }

    get DeletingID()
    {
        return this._DeletingPlanID;
    }

    get Thread_id()
    {
        return this._thread_id;
    }

    get CloseSecTime()
    {
        return this._closeSecTime;
    }

    IsActivationPageTopLowerLimit(scrollValue)
    {
        return scrollValue < this._activationLowerLimit ;
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

    ExistsDeleteItem(IsResult)
    {
        if(IsResult)
        {
            return '返信コメントの削除が完了しました。'
        }
        else
        {
            return '削除に失敗しました。'
        }
    }

    IsTypeUndifined(value)
    {
        if(typeof value === 'undefined')
        {
            return true
        }
        else
        {
            return false
        }
    }

}



window.addEventListener('load',function(){

    const thread_data = new thread;
    const submit = document.querySelector("#btnsubmit");
    const js_drawer = document.querySelector('.js-drawer');
    const reload = document.querySelector('.js-reload');

    //初回読み込みを行
    fetchCommentdata(thread_data.createFetchThread()).then((result) =>
    {

        newCommentDOM(createDOMFragment(result));
        thread_data.threadinfo = result;
    });

    //データベースへ登録する 書き込みをする
    submit.addEventListener('click',function(){
        console.log('クリック');
        let comment = document.querySelector(".comment").value;

        if(comment.length == 0 && thread_data.IsAjaxProcsessing)
        {
            return false;
        }

        thread_data.IsAjaxProcsessing  = true;
        let input_list = [];
        input_list['username'] = document.querySelector(".username").value;
        input_list['email'] = document.querySelector(".email").value;
        input_list['deletepass'] = document.querySelector(".deletepass").value;
        input_list['comment'] = comment;

        let thread_list = thread_data.threadinfo;

        let list = Object.assign(input_list,thread_list);
        insertInputData(list).then(() =>
        {
            return fetchCommentdata(thread_data.createFetchThread());
        })
        .then((result) => 
        {
            if(thread_data.IsTypeUndifined(result))
            {
                thread_data.IsAjaxProcsessing = false;
                return;
            }
            appendDOMFragment(createDOMFragment(result,thread_data));
            thread_data.IsAjaxProcsessing = false;
        })
        .catch((err) =>
        {

            //エラー表示をモーダル画面で表示する(予定)
            thread_data.IsAjaxProcsessing = false;
        });
    },false);

    //更新ボタン押下時のスレッド内容読み取り
    reload.addEventListener('click' ,() =>
    {
        if(thread_data.IsAjaxProcsessing)
        {
            return false;
        }
        const icon_reload = document.querySelector('.icon-reload');
        icon_reload.classList.add('__loading');
        thread_data.IsAjaxProcsessing = true;

        fetchCommentdata(thread_data.createFetchThread()).then((result) =>
        {
            if(thread_data.IsTypeUndifined(result))
            {
                thread_data.IsAjaxProcsessing = false;
                icon_reload.classList.remove('__loading');
                return;
            }
            appendDOMFragment(createDOMFragment(result,thread_data));
            thread_data.IsAjaxProcsessing = false;
            icon_reload.classList.remove('__loading');
        })
        .catch((err) =>
        {
            //エラー表示をモーダル画面で表示する(予定)
            icon_reload.classList.remove('__loading');
            thread_data.IsAjaxProcsessing = false;
        })
    },false);

    js_drawer.addEventListener('click',() =>
    {
        document.querySelector('#main-form').classList.toggle('--hidden');
        document.querySelector('.js-drawer').classList.toggle('__open');
        document.querySelector('.icon-formopen').classList.toggle('__open');
    },false);


    const scrollUpperBottom = document.querySelector('.js-userinterface__item','.js-scrollupper');

    scrollUpperBottom.addEventListener('click',() =>
    {
        //200未満は画面の移動をさせない
        if(thread_data.IsActivationPageTopLowerLimit(document.documentElement.scrollTop))
        {
            return;
        }
            //画面の描写位置をトップに戻す 
            document.documentElement.scrollTop = 0;

    },false);

    window.document.addEventListener('scroll' ,() =>
    {
        //200未満はボタンの表示を半透明にし、押せない事を表現
        if(thread_data.IsActivationPageTopLowerLimit(document.documentElement.scrollTop))
        {
            scrollUpperBottom.classList.add('__inactive')
        }
        else
        {
            //200以上は押せることを表現
            scrollUpperBottom.classList.remove('__inactive')
        }

        /**メッセージモーダルの位置調整処理
         * スクロールされたらTOP:0に固定する
         */
        if(document.documentElement.scrollTop > 15)
        {
            document.querySelector('.messagemodal').classList.add('--Pagetop');
        }
        else
        {
            document.querySelector('.messagemodal').classList.remove('--Pagetop');
        }
        

    },false);


    /**
     * 返信レスのDOMの作成を行う
     * 初回ロード時に行う処理なので、section部分から作成しそれにFragmentを挿入
     * @param Fragment :DOMFragment
     * @return boolean 
     * **/
    function newCommentDOM(DOMFragment)
    {
       let $section = document.createElement('section');
       $section.classList.add('main__body');
       $section.classList.add('__show');
       $section.appendChild(DOMFragment);
    
       let comment_area = document.querySelector('#main-content');
       comment_area.appendChild($section);

       return true;
    }
    
    /**
     * 返信レスのDOMの作成を行う
     * 2回目以降の作成なのでsetion部分の作成等は省き、既存のDOMにFragmentを挿入
     * @param Fragment :DOMFragment
     * @return boolean 
     * **/
    function appendDOMFragment(DOMFragment)
    {
        document.querySelector('.main__body').appendChild(DOMFragment);
        return true;
    }
    
    function createDOMFragment(fetchdata)
    {
        let fragment = document.createDocumentFragment();  
        let response_No = thread_data.responseNo;
    
       //取得した配列をループで一つ一つの要素を抜き出し
        fetchdata.forEach(element => {
    
            if(element['delete_flg'])
            {
                return;
            }

            response_No += 1;
    
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
            $button_delete.classList.add('js-resdelete');
            //data属性を付与する
            $button_delete.setAttribute('data-id',element['ID']);
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
    
            //最後に挿入処理を置くことで、表示順番管理をしやすいようにする
            $div.appendChild($ResNo);
            $div.appendChild($p_comment);
            $div.appendChild($DB_no);
            $div.appendChild($span_username);
            $div.appendChild($span_writingtime);
            $div.appendChild($button_delete);
    
            fragment.appendChild($div);
        });

        //取得データの最後のDBIDを保持することで、どこまで読み込んだかを覚えておくようにする
        thread_data.responseNo = fetchdata[fetchdata.length -1]['ID'];
    
        return fragment;
    }

    function deleteEvent()
    {
        const delete_password = document.querySelector('.modalwindow__text').value;
        searchRecode(thread_data.Thread_id,thread_data.DeletingID,delete_password).then((result) =>
        {
            /**
             * パスワードが一致し、レコードが存在している場合のみ削除処理を行う
             */
            modalWindowClose();
            //API側で判定したパスワード一致チェックとデータ取得チェックの両方が真でない場合は、削除処理を行わない
            //真でない場合は、削除ができない事を通知
            if(result['IsPasswordVerifty'] && result['IsResult'])
            {
                return deleteRecode(thread_data);
            }
            else
            {
                return false;
            }
        })
        .then((result) =>
        {
            showMessageModal(thread_data.ExistsDeleteItem(result));
            closeMessageModal(thread_data.CloseSecTime);
        })
        .catch(($err) =>
        {
            /**
             * エラーの場合は、メッセージウィンドウにエラーを表示する
             */
            showMessageModal('処理に失敗しました。');
            closeMessageModal(thread_data.CloseSecTime);
        })
    }

    function deleteModalWindowOpen(event)
    {
        const DeleteMessagetitle = 'この書き込みを削除しますか？';
        const DeleteSubmitButtomText = '削除';
        const SubmitButtomDelete = '__deleting';
        const DOMResNo = event.target.getAttribute('data-id');
    
        //モーダルウィンドウを表示する汎用の関数へ
        modalWindowOpen(DeleteMessagetitle,DeleteSubmitButtomText,SubmitButtomDelete);
    
        //削除キー入力フォームを表示する
        document.querySelector('.modalwindow__text').classList.remove('--hidden');
    
        //Submitボタンへイベントを登録
        document.querySelector('.modalButtom__Submit').addEventListener('click',deleteEvent,true);
    
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
    
        const modalSubmitbutton = document.querySelector('.modalButtom__Submit');
        //Submitボタンの名前を設定する
        modalSubmitbutton.appendChild(document.createTextNode(buttonText));
    
        //Submitのクラス名を設定する
        modalSubmitbutton.classList.add(submitClassName);
    
        //モーダルウィンドウのバック黒画面をクリックしたときのイベントを追加する
        document.querySelector('.modalwindow__back').addEventListener('click',modalWindowClose,false);
        document.querySelector('.modalButtom__Cancel').addEventListener('click',modalWindowClose,false);
        document.querySelector('.js_modalWindow__close').addEventListener('click',modalWindowClose,false);
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
        const modalSubmitbutton = document.querySelector('.modalButtom__Submit');
        modalSubmitbutton.removeChild(modalSubmitbutton.firstChild);
    
        //Submit用ボタンのスタイル指定を解除する
        const classList = modalSubmitbutton.classList;
        modalSubmitbutton.classList.remove(classList[classList.length -1]);
    
        //表示しているアイテムをすべて削除する
        const modalWindowNodeList = document.querySelector('.modalwindow__item');
        modalWindowNodeList.textContent = null;
    
        //削除キー入力欄が表示されていた場合、非表示にする
        const modalwindowDelInputform = document.querySelector('.modalwindow__text');
        /**
         * 入力したテキストを削除
         */
        modalwindowDelInputform.value = "";
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

            if(thread_data.IsTypeUndifined(result))
            {
                modalWindowClose();
                showMessageModal('内容を取得できませんでした。時間を置いて再度操作を行ってください。')
                closeMessageModal(thread_data.CloseSecTime);
                return;
            }

            /*表示する内容のDOMを作成する
            * @param string $response_text
            * @param string $resoponse_time
            */
            let $response_text = document.createElement('p');
            $response_text.classList.add('main-content__text');
            $response_text.appendChild(document.createTextNode(result[0]['comment']));
    
            let $resoponse_time = document.createElement('p');
            $resoponse_time.classList.add('main-content__text','__time');
            $resoponse_time.appendChild(document.createTextNode(result[0]['create_data']));
    
            modalItem.appendChild($response_text);
            modalItem.appendChild($resoponse_time);

            //削除IDをクラスで保存しておく
            thread_data.DeletingID = result[0]['ID'];
    
            //すべての処理が終わったため、フラグをOFFにする
            thread_data.IsAjaxProcsessing = false;
        })
        .catch(($err)=>
        {
            //すべての処理が終わったため、フラグをOFFにする
            thread_data.IsAjaxProcsessing = false;
        })
    }
    
    function showMessageModal(MessageText)
    {
        let $MessageText = document.createElement('p');
        $MessageText.classList.add('messagemodal__text');
        $MessageText.appendChild(document.createTextNode(MessageText));

        document.querySelector('.messagemodal__body').appendChild($MessageText);
        document.querySelector('.messagemodal__body').classList.remove('messagemodal__body--is_hidden');
    }

    /**
     * 
     * @param {遅延時間} delayTime 
     */
    async function closeMessageModal(delayTime)
    {
        const result = await delayProcessing(delayTime);
        if(result)
        {
            document.querySelector('.messagemodal__body').classList.add('messagemodal__body--is_hidden');
            document.querySelector('.messagemodal__body').textContent = null;
        }
    }

    /**非同期処理
     * fetchCommentdata:DBからデータを取得
     * 
     */
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
                try
                {
                    switch(xhr.readyState)
                    {
                        case 4:
                            if(xhr.status == 200)
                            {
                                const result_data = JSON.parse(xhr.responseText);
                                resolve(result_data);
                            }
                            else
                            {
                                reject();
                            }
                            break;
                    }
                }
                catch(e)
                {
                    reject();
                }
            }
        })
    }

    //非同期スレッド内容書き込み処理
    function insertInputData($array)
    {
        return new Promise(function(resolve,reject)
        {
            let xhr = new XMLHttpRequest();
            xhr.open('POST','insertAjax.php',true);
            xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
            xhr.send(
                'name='         + encodeURIComponent($array['username'])      + '&' +
                'email='        + encodeURIComponent($array['email'])         + '&' +
                'delete_pass='  + encodeURIComponent($array['deletepass'])    + '&' +
                'comment='      + encodeURIComponent($array['comment'])       + '&' +
                'thread_id='    + encodeURIComponent($array['thread_id'])     + '&' +
                'last_database_id='+ encodeURIComponent($array['last_database_id']),
                );

            xhr.onreadystatechange = function()
            {
                try
                {
                    switch(xhr.readyState)
                    {
                        case 4:
                            if(xhr.status == 200)
                            {
                                const result_data = JSON.parse(xhr.responseText);
                                resolve(result_data);
                            }
                            else
                            {
                                reject();
                            }
                            break;
                    }
                }
                catch(e)
                {
                    reject();
                }
            }
        })
    }

    function deleteRecode(thread_data,delete_password)
    {
        return new Promise((resolve,reject) =>
        {
            let xhr = new XMLHttpRequest();
            /*論理削除でレコード削除を行う
            *
            */
            xhr.open('POST','updateAjax.php',true);
            //xhr.open('POST','deleteAjax.php',true);
            xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');

            xhr.send(
                'thread_id='      + encodeURIComponent(thread_data.Thread_id) + '&' + 
                'DeletingID='     + encodeURIComponent(thread_data.DeletingID) + '&' +
                'DeletePass='     + encodeURIComponent(delete_password)
            );
        
            xhr.onreadystatechange = function()
            {
                try
                {
                    switch(xhr.readyState)
                    {
                        case 4:
                            if(xhr.status == 200)
                            {
                                const result_data = JSON.parse(xhr.responseText);
                                resolve(result_data);
                            }
                            else
                            {
                                reject();
                            }
                            break;
                    }
                }
                catch(e)
                {
                    reject();
                }
            }
        })
    }

    function searchRecode(thread_ID,data,delete_pass)
    {
        return new Promise((resolve,reject) =>
        {
            let xhr = new XMLHttpRequest();
            xhr.open('POST','searchAjax.php',true);
            xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
            xhr.send(
                'thread_id=' + encodeURIComponent(thread_ID) + '&' + 
                'data='      + encodeURIComponent(data) + '&' + 
                'delete_pass='+ encodeURIComponent(delete_pass)
            );
        
            xhr.onreadystatechange = function()
            {
                try
                {
                    switch(xhr.readyState)
                    {
                        case 4:
                            if(xhr.status == 200)
                            {
                                const result_data = JSON.parse(xhr.responseText);
                                resolve(result_data);
                            }
                            else
                            {
                                reject();
                            }
                            break;
                    }
                }
                catch(e)
                {
                    reject();
                }
            }
        })
    }

    
    function delayProcessing(delayTime)
    {
        console.log(delayTime);
        return new Promise((resolve) =>
        {
            setTimeout(() =>
            {
                resolve(true);
            },delayTime);
        })
    }

},false);




