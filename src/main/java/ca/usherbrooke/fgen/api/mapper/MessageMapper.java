package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageMapper {

  List<Message> select(
      @Param("discussionId") String discussionId,
      @Param("limite") Integer limite,
      @Param("decalage") Integer decalage,
      @Param("cip") String cip,
      @Param("messageId") String messageId);

  Message selectOne(@Param("messageId") String messageId);

  void deleteOne(@Param("messageId") String messageId, @Param("discussionId") String discussionId);

  void insertMessage(@Param("message") Message message);

  String getNewId();
}
