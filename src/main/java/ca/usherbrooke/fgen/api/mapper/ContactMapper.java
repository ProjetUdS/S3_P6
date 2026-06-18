package ca.usherbrooke.fgen.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ContactMapper {

    void insertContact(@Param("cip") String cip, @Param("cipContact") String cipContact);

    void deleteContact(@Param("cip") String cip, @Param("cipContact") String cipContact);

    List<String> selectContacts(@Param("cip") String cip);
}