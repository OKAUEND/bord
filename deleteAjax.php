<?php

require('DBconnect.php');

header('Content-Type: application/json; charset=UTF-8');

$_REQUEST;

if(empty($_POST))
{
    //サーバーエラーとしてフロントにエラー情報を返す
    header("HTTP/1.1 500 Internal Server Error");
    die();
}

$thread_id = $_POST['thread_id'];
$response_no = explode(',',$_POST['data']);

try
{

    $pdo = new DBconnect();

    $table = 'comment';
    $column = 'delete_flg';

    $count = 1;

    $data = array();

    $in = '';

    foreach($response_no as $value)
    {
        if(!empty($in))
        {
            $in =  $in.',';
        }

        $in = $in.':ID'.$count;

        $data += array(
            ':ID'.$count => $value
        );
        $count += 1;
    }

    $in = 'ID IN ( '.$in.' )';

    $sql = 'UPDATE '.$table.' SET '.$column.' = true WHERE '.$in;

    $stmt = $pdo->plural($sql,$data);

    echo json_encode(true);
}
catch(PDOException $e)
{
    //サーバーエラーとしてフロントにエラー情報を返す
    header("HTTP/1.1 500 Internal Server Error");
    die();
}