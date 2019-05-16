<?php

require('DBconnect.php');

header('Content-Type: application/json; charset=UTF-8');

const UNKNOWN_USERNAME = 'ななし';

const WEEK = array("日","月","火","水","木","金","土");

const THREAD_TABLENAME = 'comment';

if(!empty($_POST))
{
    $page_type      = $_POST['page_type'];
    $thread_id      = $_POST['thread_id'];
    $last_res_no    = $_POST['last_res_no'];
    $last_res_time  = $_POST['last_res_time'];
    
    try
    {
        //SQL文を作成
        $sql = "SELECT 
                    * 
                FROM 
                    comment 
                WHERE 
                    thread_id = :thread_id 
                AND ID > :last_res_no
                ";

    
        $db = new DBconnect();

        //条件の配列を作成する
        $data = array(
            ':thread_id'        => $thread_id ,
            ':last_res_no'      => $last_res_no
        );

        //$stmt = $db->select($sql);
        $stmt = $db->plural($sql,$data);

        $list = $stmt->fetchAll();

        
        foreach($list as $key => $value)
        {
            //投稿者名を作成する
            //投稿者名が未記入だった場合、固定名を使用
            if($value['username'] === "")
            {
                $list[$key]['username'] = UNKNOWN_USERNAME;
            }
            //記入ありの場合、エスケープ処理をする
            else
            {
                $list[$key]['username'] = htmlspecialchars($value['username']);
            }

            $list[$key]['email']    = htmlspecialchars($value['email']);
            //$list[$key]['comment']  = htmlspecialchars($value['comment']);

            //日付を変換する
            //1900年1月1日(月)00:00:00の形式に変換
            $day = new DateTime($value['create_data']);
            $list[$key]['create_data'] = $day->format('Y年m月d日(').WEEK[$day->format('w')].$day->format(')H:i:s');

            //削除フラグをboolean型に変換する
            if($value['delete_flg'])
            {
                $list[$key]['delete_flg'] = true;
            }
            else
            {
                $list[$key]['delete_flg'] = false;
            }
        }
        unset($value);
        
        echo json_encode($list);
    }
    catch(Exception $ex)
    {
        //サーバーエラーとしてフロントにエラー情報を返す
        header("HTTP/1.1 500 Internal Server Error");
        die();
    }
}