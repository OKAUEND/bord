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
$DeletingID = $_POST['DeletingID'];

try
{
    $pdo = new DBconnect();

    $table = 'comment';
    $column = 'delete_flg  = true ';
    $Where = 'ID = :ID';

    $data = array(
        ':ID' => $DeletingID
    );

    $sql = 'UPDATE '.$table.' SET '.$column.'WHERE '.$Where;

    $stmt = $pdo->plural($sql,$data);

    echo json_encode($stmt);
}
catch(PDOException $e)
{
    //サーバーエラーとしてフロントにエラー情報を返す
    header("HTTP/1.1 500 Internal Server Error");
    die();
}