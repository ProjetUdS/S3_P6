package ca.usherbrooke.fgen.api.mapper;


import ca.usherbrooke.fgen.api.business.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageMapper {

    List<Message> select(@Param("discussionId") String discussionId,
                         @Param("limite") Integer limit,
                         @Param("decalage") Integer offset,
                         @Param("messageId") String messageId);
    List<Message> allMessages( @Param("discussionId") String discussionId);
    Message selectOne(@Param("id") Integer id);
    void deleteOne(@Param("id") Integer id);
    void insertMessage(@Param("message") Message message,
                       @Param("discussionId") String discussionId);
    String getNewId();
}
