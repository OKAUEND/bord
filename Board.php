<?php

class Board
{
    const PAGE_TYPE_BORD = 'thread';
    const PAGE_TYPE_LIST = 'list';

    const BOARD_TABLE_NAME = 'comment';
    const LIST_TABLE_NAME = '';

    private $thread_id;
    private $res_no_list;

    function __construct($page_type,$data)
    {
        
    }
}